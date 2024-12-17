import {
  BadRequestException,
  HttpException,
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
    private readonly roleService: RolesService,
    private readonly emailService: EmailService,
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

      if (roleId) {
        const checkRole = await this.roleService.getRoleById(roleId);
        if (!checkRole) {
          throw new BadRequestException('Role id not found');
        }
      }

      const decryptedPassword = this.validateConfirmPassword(
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

      const decryptedPassword = this.validateConfirmPassword(
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

      if (!user) {
        throw new BadRequestException('username not found');
      }

      await this. validateUser(password, user, deviceType);

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

      const decryptedPassword: string = this.validateConfirmPassword(
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
          expiresIn: '1d',
        },
      );
      const emailTemplate = this.emailService.generateVerificationEmail(
        fullName,
        token,
      );

      await this.emailService.sendEmail({
        to: email,
        subject: 'Email Verification',
        html: emailTemplate,
      });

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

      return await this.userService.approveUser(
        userAuth.userId,
        userAuth.userId,
        userAuth.role.roleId,
      );
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
      if(!user.active){
        throw new BadRequestException(
          'Account is not active',
        );
      }

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
