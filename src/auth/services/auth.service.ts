import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../users/services/user.service';
import * as bcrypt from 'bcrypt';
import { format } from 'date-fns';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../../users/entity/user.entity';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { SessionService } from '../../libs/session/service/session.service';
import { DeviceType } from '../../common/enums/device-type.enum';
import { UserLogActivitiesService } from '../../user_log_activities/service/user_log_activities.service';
import { RolesService } from '../../roles/service/roles.service';
import { EmailService } from '../../libs/email/services/email.service';
import { SessionTimeoutException } from '../../common/exceptions/http-exception.filter';
import { UsersAuth } from '../../users/entity/user-auth.entity';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { SetPasswordDto } from '../dto/set-password.dto';

@Injectable()
export class AuthService {
  private googleAuthClient: OAuth2Client;

  constructor(
    private readonly utils: UtilsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userLogActivitiesService: UserLogActivitiesService,
    private readonly roleService: RolesService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.googleAuthClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );
  }

  generatePassword(generatePasswordDto: GeneratePasswordDto) {
    try {
      const { password, confirmPassword } = generatePasswordDto;

      const encryptedPassword = this.utils.encrypt(password);
      const encryptedConfirmPassword = this.utils.encrypt(confirmPassword);

      return {
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error generating password',
        e.status || 500,
      );
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const {
        password,
        confirmPassword,
        roleId,
        birthdate,
        phoneNumber,
        username,
        fullName,
        email,
      } = registerDto;

      if (roleId) {
        const checkRole = await this.roleService.getRoleById(roleId);
        if (!checkRole) {
          throw new BadRequestException('Role id not found');
        }
      }

      const decryptedPassword = this.utils.validateConfirmPassword(
        password,
        confirmPassword,
      );

      await this.userService.validateUsernameEmail(username, email);

      const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

      const [user] = await Promise.all([
        this.userService.createUser({
          fullName,
          birthdate,
          roleId,
          email,
          username,
          password: hashedPassword,
          phoneNumber,
        }),
      ]);

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        birthdate: format(new Date(user.birthdate), 'yyyy-MM-dd'),
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error registering user',
        e.status || 500,
      );
    }
  }

  async registerApproval(registerDto: RegisterDto) {
    try {
      const {
        password,
        confirmPassword,
        roleId,
        birthdate,
        phoneNumber,
        username,
        fullName,
        email,
      } = registerDto;

      const decryptedPassword = this.utils.validateConfirmPassword(
        password,
        confirmPassword,
      );

      await this.userService.validateUsernameEmail(username, email, true);

      const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

      const [user] = await Promise.all([
        this.userService.createUserAuth({
          fullName,
          birthdate,
          roleId,
          email,
          username,
          password: hashedPassword,
          phoneNumber,
        }),
      ]);

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        birthdate: format(new Date(user.birthdate), 'yyyy-MM-dd'),
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        e.message || 'Error registering user',
        e.status || 500,
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { username, password, ipAddress, deviceType } = loginDto;

      const user = await this.userService.getUserByUsername(username);
      console.log(user);

      if (!user) {
        await this.validateUserAuth(username);
        throw new BadRequestException('username not found');
      }

      await this.validateUser(password, user, deviceType);

      const payload: JwtPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roleName: user.role.roleName,
        roleType: user.role.roleType,
        roleId: user.role.roleId,
        ipAddress,
        deviceType,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_ACCESS_TOKEN'),
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_REFRESH_TOKEN'),
      });

      await Promise.all([
        this.sessionService.createSession(
          `session:${user.userId}:${deviceType}`,
          accessToken,
          15 * 60,
        ),
        this.sessionService.createSession(
          `refresh:${user.userId}:${deviceType}`,
          refreshToken,
          3 * 24 * 60 * 60, // 3 days
        ),
        this.userLogActivitiesService.deleteUserActivityByDescription(
          user.userId,
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error logging in user',
        e.status || 500,
      );
    }
  }

  async loginWithGoogle(ipAddress: string, deviceType: string) {
    try {
      const state: string = this.utils.encrypt(
        JSON.stringify({
          ipAddress,
          deviceType,
        }),
      );

      return this.googleAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile'],
        prompt: 'consent',
        include_granted_scopes: true,
        state,
      });
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to login with google',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleGoogleLoginCallback(code: string, state: string) {
    try {
      const { ipAddress, deviceType } = JSON.parse(this.utils.decrypt(state));
      const { tokens } = await this.googleAuthClient.getToken(code);
      this.googleAuthClient.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.googleAuthClient,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();

      const user = await this.userService.getUserByEmail(data.email);

      if (!user) {
        await this.validateUserAuth(data.email);
        throw new BadRequestException('User not found');
      }

      const isAttemptValid = await this.validateLoginAttemptLog(user.userId);
      if (!isAttemptValid) {
        throw new UnauthorizedException(
          'Failed to login due to 5 failed attempt !!',
        );
      }

      if (!user.active) {
        throw new BadRequestException('Account is not active');
      }

      const isSessionValid = await this.validateUserSession(
        user.userId,
        deviceType,
      );
      if (!isSessionValid) {
        throw new UnauthorizedException(
          'There is an active session for this user, please logout first !!',
        );
      }

      const payload: JwtPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roleName: user.role.roleName,
        roleType: user.role.roleType,
        roleId: user.role.roleId,
        ipAddress,
        deviceType,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_ACCESS_TOKEN'),
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_REFRESH_TOKEN'),
      });

      await Promise.all([
        this.sessionService.createSession(
          `session:${user.userId}:${deviceType}`,
          accessToken,
          15 * 60,
        ),
        this.sessionService.createSession(
          `refresh:${user.userId}:${deviceType}`,
          refreshToken,
          3 * 24 * 60 * 60, // 3 days
        ),
        this.userLogActivitiesService.deleteUserActivityByDescription(
          user.userId,
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when user try to login with google',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(user: JwtPayload, token: string) {
    try {
      const refreshToken = await this.sessionService.getSession(
        `refresh:${user.userId}:${user.deviceType}`,
      );

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: JwtPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roleName: user.roleName,
        roleType: user.roleType,
        ipAddress: user.ipAddress,
        deviceType: user.deviceType,
        roleId: user.roleId,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_ACCESS_TOKEN'),
      });

      await this.sessionService.deleteSession(
        `session:${user.userId}:${user.deviceType}`,
      );

      await Promise.all([
        this.sessionService.createSession(
          `session:${user.userId}:${user.deviceType}`,
          accessToken,
          15 * 60,
        ),
      ]);

      return {
        accessToken,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error refreshing token',
        e.status || 500,
      );
    }
  }

  async logout(user: JwtPayload) {
    try {
      await Promise.all([
        this.sessionService.deleteSession(
          `session:${user.userId}:${user.deviceType}`,
        ),
        this.sessionService.deleteSession(
          `refresh:${user.userId}:${user.deviceType}`,
        ),
      ]);

      return {
        message: 'Logout success',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error logging out user',
        e.status || 500,
      );
    }
  }

  async logoutAllDevices(userId: string) {
    try {
      await Promise.all([
        this.sessionService.deleteSession(
          `session:${userId}:${DeviceType.WEB}`,
        ),
        this.sessionService.deleteSession(
          `refresh:${userId}:${DeviceType.WEB}`,
        ),
        this.sessionService.deleteSession(
          `session:${userId}:${DeviceType.MOBILE}`,
        ),
        this.sessionService.deleteSession(
          `refresh:${userId}:${DeviceType.MOBILE}`,
        ),
      ]);

      return {
        message: 'Logout all devices success',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error logging out all devices',
        e.status || 500,
      );
    }
  }

  async registerWithEmailVerification(registerDto: RegisterDto) {
    try {
      const {
        password,
        confirmPassword,
        roleId,
        email,
        username,
        fullName,
        phoneNumber,
        birthdate,
      } = registerDto;

      if (roleId && !(await this.roleService.getRoleById(roleId))) {
        throw new BadRequestException('Role id not found');
      }

      const decryptedPassword: string = this.utils.validateConfirmPassword(
        password,
        confirmPassword,
      );
      const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

      const existingUserAuth: UsersAuth = await this.validateRegisterWithEmail(
        email,
        username,
      );

      let userAuthId: string;
      if (existingUserAuth) {
        userAuthId = existingUserAuth.userId;
      } else {
        const userAuth = await this.userService.createUserAuth({
          fullName,
          birthdate,
          roleId,
          email,
          username,
          password: hashedPassword,
          phoneNumber,
        });

        userAuthId = userAuth.userId;
      }

      const token = await this.jwtService.signAsync(
        {
          userAuthId,
        },
        {
          expiresIn: this.configService.get('EXPIRED_REGISTER_EMAIL_TOKEN'),
        },
      );
      const emailTemplate = this.emailService.generateVerificationEmail(
        fullName,
        token,
      );

      await Promise.all([
        this.sessionService.createSession(
          `register-email:${userAuthId}`,
          token,
          24 * 60 * 60,
        ),
        this.emailService.sendEmail({
          to: email,
          subject: 'Email Verification',
          html: emailTemplate,
        }),
      ]);

      return { message: 'Email verification has been sent' };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error registering user',
        e.status || 500,
      );
    }
  }

  async createUserByToken(token: string) {
    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);

      const isTokenValid = await this.sessionService.getSession(
        `register-email:${tokenPayload.userAuthId}`,
      );

      if (!isTokenValid) {
        throw new UnauthorizedException(
          'Link has been expired, please register again',
        );
      }

      const userAuth = await this.userService.getUserAuthById(
        tokenPayload.userAuthId,
      );

      if (!userAuth) {
        throw new NotFoundException('User auth not found');
      }

      await this.userService.validateUsernameEmail(
        userAuth.username,
        userAuth.email,
      );

      const [newUser] = await Promise.all([
        this.userService.approveUser(
          {
            roleId: userAuth.role.roleId,
            userAuthId: userAuth.userId,
          },
          userAuth.userId,
        ),
        this.sessionService.deleteSession(
          `register-email:${tokenPayload.userAuthId}`,
        ),
      ]);

      return newUser;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new SessionTimeoutException(
          'Link has been expired, please register again',
        );
      }

      throw new HttpException(
        e.message || 'Error creating user by token',
        e.status || 500,
      );
    }
  }

  async sendForgotPasswordEmail(email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new NotFoundException('This email is not registered as a user');
      }

      const token: string = await this.jwtService.signAsync(
        {
          userId: user.userId,
        },
        {
          expiresIn: this.configService.get('EXPIRED_EMAIL_TOKEN'),
        },
      );

      const emailTemplate: string =
        this.emailService.generateSendForgotPasswordEmail(user.fullName, token);

      await Promise.all([
        this.emailService.sendEmail({
          to: email,
          subject: 'Forgot Password',
          html: emailTemplate,
        }),
        this.sessionService.createSession(
          `reset-password:${user.userId}`,
          token,
          15 * 60,
        ),
      ]);

      return { message: 'Forgot password email has been sent' };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error sending forgot password email',
        e.status || 500,
      );
    }
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    try {
      const { password, confirmPassword, token } = setPasswordDto;

      const decryptedPassword = this.utils.validateConfirmPassword(
        password,
        confirmPassword,
      );

      const tokenPayload = await this.jwtService.verifyAsync(token);

      const isTokenValid = await this.sessionService.getSession(
        `reset-password:${tokenPayload.userId}`,
      );

      if (!isTokenValid) {
        throw new UnauthorizedException(
          'Link has been expired, please reset password again',
        );
      }

      const user: Users = await this.userService.getUser(tokenPayload.userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword: string = await bcrypt.hash(decryptedPassword, 10);

      await Promise.all([
        await this.userService.setPassword(user.userId, hashedPassword),
        await this.sessionService.deleteSession(
          `reset-password:${user.userId}`,
        ),
      ]);

      return {
        message: 'Password has been set',
        userId: user.userId,
      };
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new SessionTimeoutException(
          'Link has been expired, please reset password again',
        );
      }

      throw new HttpException(
        e.message || 'Error setting password',
        e.status || 500,
      );
    }
  }

  private async validateRegisterWithEmail(
    email: string,
    username: string,
  ): Promise<UsersAuth> {
    try {
      const [checkEmail, checkUsername] = await Promise.all([
        this.userService.getUserByEmail(email),
        this.userService.getUserByUsername(username),
      ]);

      if (checkUsername) {
        throw new BadRequestException(
          'Username already registered, please use another username',
        );
      }

      if (checkEmail) {
        throw new BadRequestException(
          'Email already registered, please use another email',
        );
      }

      const [checkEmailAuth, checkUsernameAuth] = await Promise.all([
        this.userService.getUserAuthByEmail(email),
        this.userService.getUserAuthByUsername(username),
      ]);

      if (checkUsernameAuth) {
        await this.userService.updateUserAuthEmail(
          checkUsernameAuth.userId,
          email,
        );
      }

      return checkUsernameAuth || checkEmailAuth;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating register with email',
        e.status || 500,
      );
    }
  }

  private async validateUser(
    password: string,
    user: Users,
    deviceType: DeviceType,
  ) {
    try {
      if (!password.startsWith('U2F')) {
        throw new BadRequestException(
          'Invalid password format, must be encrypted',
        );
      }

      const isAttemptValid = await this.validateLoginAttemptLog(user.userId);
      if (!isAttemptValid) {
        throw new UnauthorizedException(
          'Failed to login due to 5 failed attempt !!',
        );
      }

      if (!user.active) {
        throw new BadRequestException('Account is not active');
      }

      const isPasswordValid = await this.validateUserPassword(password, user);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const isSessionValid = await this.validateUserSession(
        user.userId,
        deviceType,
      );

      if (!isSessionValid) {
        throw new UnauthorizedException(
          'There is an active session for this user, please logout first !!',
        );
      }
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating user',
        e.status || 500,
      );
    }
  }

  private async validateUserAuth(identifier: string) {
    try {
      const userAuthByUsername =
        await this.userService.getUserAuthByUsername(identifier);
      const userAuthByEmail =
        await this.userService.getUserAuthByEmail(identifier);

      if (
        userAuthByUsername &&
        userAuthByUsername.requestStatus !== 'Approved'
      ) {
        throw new BadRequestException(
          `Username cannot be used because the status is ${userAuthByUsername.requestStatus}, please contact the administrator for further information`,
        );
      }

      if (userAuthByEmail && userAuthByEmail.requestStatus !== 'Declined') {
        throw new BadRequestException(
          `Email cannot be used because the status is ${userAuthByEmail.requestStatus}, please contact the administrator for further information`,
        );
      }
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating user auth',
        e.status || 500,
      );
    }
  }

  private async validateUserPassword(password: string, user: Users) {
    try {
      const isPasswordValid = await bcrypt.compare(
        this.utils.decrypt(password),
        user.password,
      );
      if (!isPasswordValid) {
        return false;
      }

      return true;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating user password',
        e.status || 500,
      );
    }
  }

  private async validateUserSession(userId: string, deviceType: string) {
    try {
      const activeSession = await this.sessionService.getSession(
        `session:${userId}:${deviceType}`,
      );

      if (activeSession) {
        return false;
      }

      return true;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating user session',
        e.status || 500,
      );
    }
  }

  private async validateLoginAttemptLog(userId: string) {
    try {
      const failedLogin =
        await this.userLogActivitiesService.getUserActivityByDescription(
          userId,
          'Invalid password',
        );

      if (failedLogin.totalItems >= 4) {
        await this.userService.banUser(userId, userId);
        return false;
      }

      return true;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating login attempt log',
        e.status || 500,
      );
    }
  }
}
