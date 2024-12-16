import {
  BadRequestException,
  HttpException,
  Injectable,
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

@Injectable()
export class AuthService {
  private strongPassword: RegExp = new RegExp(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/,
  );

  constructor(
    private readonly utils: UtilsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userLogActivitiesService: UserLogActivitiesService,
  ) {}

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

      const decryptedPassword = this.validateConfirmPassword(
        password,
        confirmPassword,
      );

      await this.validateUsernameEmail(username, email);

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

      const decryptedPassword = this.validateConfirmPassword(
        password,
        confirmPassword,
      );

      await this.validateUsernameEmail(username, email, true);

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

      if (!user) {
        throw new BadRequestException('username not found');
      }

      await this.validateUser(password, user, deviceType);

      const payload: JwtPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roleName: user.role.roleName,
        roleType: user.role.roleType,
        ipAddress,
        deviceType,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '3d',
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
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
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

  private async validateUser(
    password: string,
    user: Users,
    deviceType: DeviceType,
  ) {
    try {
      if (!user.active) {
        throw new UnauthorizedException('User is already banned !!');
      }

      const isAttemptValid = await this.validateLoginAttemptLog(user.userId);
      if (!isAttemptValid) {
        throw new UnauthorizedException(
          'Failed to login due to 5 failed attempt !!',
        );
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

  private async validateUsernameEmail(
    username: string,
    email: string,
    isApproval = false,
  ) {
    const [userByUsername, userByEmail] = await Promise.all([
      this.userService.getUserByUsername(username),
      this.userService.getUserByEmail(email),
    ]);

    if (userByUsername) {
      throw new BadRequestException(
        'Username is registered in our system, please use another username',
      );
    }

    if (userByEmail) {
      throw new BadRequestException(
        'Email is registered in our system, please use another email',
      );
    }

    if (isApproval) {
      const userAuthByUsername =
        await this.userService.getUserAuthByUsername(username);
      const userAuthByEmail = await this.userService.getUserAuthByEmail(email);

      if (userAuthByUsername) {
        throw new BadRequestException(
          'Username already registered, Please wait for approval or contact admin',
        );
      }

      if (userAuthByEmail) {
        throw new BadRequestException(
          'Email already registered, Please wait for approval or contact admin',
        );
      }
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
        // await this.userService.banUser(userId, userId);
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
