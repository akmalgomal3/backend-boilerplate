import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { Users } from '../../users/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { UtilsService } from '../../common/utils/services/utils.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '../../libs/session/services/session.service';
import { addHours } from 'date-fns';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { DeviceType, UserRoles } from '../../common/enums/user.enum';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';
import { ElasticsearchService } from '../../libs/elasticsearch/services/elasticsearch.service';
import { IpType } from '../../common/types/ip.type';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../libs/email/email.service';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private strongPassword: RegExp = new RegExp(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/,
  );

  private googleAuthClient;

  constructor(
    private readonly userService: UserService,
    private readonly utils: UtilsService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly elasticClient: ElasticsearchService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.googleAuthClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );
  }

  async register(
    registerDto: RegisterDto,
    logData: CreateLogDto,
  ): Promise<Users> {
    try {
      const { email, username, role } = registerDto;
      const password: string = this.validateConfirmPassword(
        registerDto.password,
        registerDto.confirmPassword,
      );

      const isExist: boolean = await this.userService.getUniqueUser(
        username,
        email,
      );

      if (isExist) {
        throw new BadRequestException('username / email already taken !!');
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);

      const [user] = await Promise.all([
        this.userService.createUser({
          email,
          username,
          password: hashedPassword,
          role,
        }),
        this.createLog(
          {
            ...logData,
            identifier: username,
          },
          `User ${username} has been registered successfully`,
          'success',
        ),
        this.emailService.sendEmail({
          html: this.emailService.generateGreetingEmail(username),
          subject: 'Registration success',
          to: email,
        }),
      ]);

      return user;
    } catch (e) {
      await this.createLog(
        {
          ...logData,
          identifier: registerDto.username || '',
        },
        `Failed to register user, due to ${e.message || 'unknown error'}`,
        'failed',
      );
      throw new HttpException(
        e.message || 'Error when user try to login',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(
    loginDto: LoginDto,
    logData: CreateLogDto,
    ipData: IpType,
  ): Promise<{ accessToken: string }> {
    const { identifier } = loginDto;
    const deviceType: DeviceType = ipData['device-type'];
    try {
      const password: string = this.utils.decrypt(loginDto.password);

      const user: Users =
        await this.userService.getUserByIdentifier(identifier);

      await this.validateUser(password, user);

      const activeSession = await this.sessionService.getUserActiveSession(
        user.id,
        deviceType,
      );

      if (activeSession) {
        if (activeSession.user_agent !== ipData['user-agent']) {
          throw new UnauthorizedException(
            'There is an active user, please logout first',
          );
        }

        await this.sessionService.deleteSession(activeSession.id);
      }
      const now = new Date();
      const [session] = await Promise.all([
        this.sessionService.createSession({
          userId: user.id,
          type: deviceType,
          lastActivity: now,
          ipAddress: ipData['ip-address'],
          expiresAt: addHours(now, 1),
          user_agent: ipData['user-agent'],
        }),
        this.sessionService.deleteUnusedSessions(user.id, deviceType),
        this.userService.setFailedLoginAttemptsToZero(user.id),
        this.createLog(
          {
            ...logData,
            user_id: user.id,
            user_role: user.role as UserRoles,
            identifier: identifier,
          },
          `User ${identifier} has login successfully`,
          'success',
        ),
      ]);

      // construct jwt payload
      const jwtPayload: JwtPayload = {
        id: user.id,
        role: user.role as UserRoles,
        email: user.email,
        username: user.username,
        device_type: deviceType,
        session_id: session.id,
        user_agent: ipData['user-agent'],
      };
      const accessToken: string = await this.jwtService.signAsync(jwtPayload, {
        expiresIn: '1h',
      });

      return {
        accessToken,
      };
    } catch (e) {
      await this.createLog(
        {
          ...logData,
          identifier: identifier,
        },
        `Failed login attempt for ${identifier}, due to ${e.message || 'unknown error'}`,
        'failed',
      );
      throw new HttpException(
        e.message || 'Error when user try to login',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginWithGoogle() {
    try {
      const authorizeUrl = await this.googleAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile'],
        prompt: 'consent',
        include_granted_scopes: true,
      });

      return authorizeUrl;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to login with google',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getClientData(code: string) {
    try {
      const tokenData = await this.googleAuthClient.getToken(code);

      const tokens = tokenData.tokens;

      this.googleAuthClient.setCredentials(tokens);

      const googleAuth = google.oauth2({
        version: 'v2',
        auth: this.googleAuthClient,
      });

      const userInfo = await googleAuth.userinfo.get();

      return userInfo.data;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        e.message || 'Error when user try to login with google',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(user: JwtPayload): Promise<{ message: string }> {
    try {
      await this.sessionService.deleteSession(user.session_id);

      return {
        message: 'User has been logged out',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to logout',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendForgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    try {
      const { email } = forgetPasswordDto;

      const user: Users = await this.userService.getUserByIdentifier(email);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const token: string = this.jwtService.sign(
        { id: user.id },
        {
          expiresIn: '15m',
        },
      );

      await this.emailService.sendEmail({
        html: this.emailService.generatePasswordResetEmail(
          user.username,
          token,
        ),
        subject: 'Reset Password',
        to: email,
      });

      return {
        message: 'Email has been sent',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to forget password',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, password, confirmPassword } = resetPasswordDto;

      const { id } = this.jwtService.verify(token) as JwtPayload;

      const user: Users = await this.userService.getUser(id);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const decryptedPassword: string = this.validateConfirmPassword(
        password,
        confirmPassword,
      );

      const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

      const updatedUser: Users = await this.userService.updateUserPassword(
        id,
        hashedPassword,
      );

      return updatedUser;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to reset password',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createLog(
    logData: CreateLogDto,
    activity: string,
    status: 'failed' | 'success',
  ): Promise<void> {
    try {
      if (!logData.location.lat || !logData.location.lon) {
        logData.location = {
          lat: 0,
          lon: 0,
        };
      }
      await this.elasticClient.createLog({
        ...logData,
        status,
        activity,
      });
    } catch (e) {
      throw e;
    }
  }

  generateEncryptedPassword(password: string, confirmPassword: string): object {
    const encryptedPassword: string = this.utils.encrypt(password);
    const encryptedConfirmPassword: string =
      this.utils.encrypt(confirmPassword);

    return {
      password: encryptedPassword,
      confirmPassword: encryptedConfirmPassword,
    };
  }

  private async validateUser(password: string, user: Users): Promise<void> {
    const isPasswordMatch: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (user.is_banned) {
      throw new UnauthorizedException('User has been banned');
    }

    if (user.failed_login_attempts >= 5) {
      await this.userService.banUser(user.id, 'Too many failed login attempts');
      throw new UnauthorizedException('User has been banned');
    }

    if (!isPasswordMatch) {
      await this.userService.addFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid password');
    }
  }

  private validateConfirmPassword(
    password: string,
    confirmPassword: string,
  ): string {
    const decryptedPassword: string = this.utils.decrypt(password);
    const decryptedConfirmPassword: string =
      this.utils.decrypt(confirmPassword);

    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException('Password does not match');
    }

    if (!this.strongPassword.test(decryptedPassword)) {
      throw new BadRequestException(
        'Password must be 8 to 12 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }

    return decryptedPassword;
  }
}
