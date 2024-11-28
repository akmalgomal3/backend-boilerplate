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
import { UserRoles } from '../../common/enums/user.enum';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';
import { ElasticsearchService } from '../../libs/elasticsearch/services/elasticsearch.service';
import { IpType } from '../../common/types/ip.type';

@Injectable()
export class AuthService {
  private strongPassword: RegExp = new RegExp(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/,
  );

  constructor(
    private readonly userService: UserService,
    private readonly utils: UtilsService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly elasticClient: ElasticsearchService,
  ) {}

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
            username,
          },
          `User ${username} has been registered successfully`,
          'success',
        ),
      ]);

      return user;
    } catch (e) {
      await this.createLog(
        {
          ...logData,
          username: registerDto.username || '',
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
    const { identifier, deviceType } = loginDto;
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
        if (activeSession.ip_address !== ipData['ip-private']) {
          await this.userService.addFailedLoginAttempts(user.id);
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
          ipAddress: ipData['ip-private'], // TODO: get real IP address
          expiresAt: addHours(now, 1),
        }),
        this.sessionService.deleteUnusedSessions(user.id, deviceType),
        this.userService.setFailedLoginAttemptsToZero(user.id),
        this.createLog(
          {
            ...logData,
            username: identifier,
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
          username: identifier,
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

  async createLog(
    logData: CreateLogDto,
    activity: string,
    status: 'failed' | 'success',
  ): Promise<void> {
    try {
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
      throw new BadRequestException('Invalid password');
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
