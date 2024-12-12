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
        role_id,
        birthdate,
        phone_number,
        username,
        full_name,
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
          full_name,
          birthdate,
          role_id,
          email,
          username,
          password: hashedPassword,
          phone_number,
        }),
      ]);

      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        birthdate: format(new Date(user.birthdate), 'yyyy-MM-dd'),
      };
    } catch (e) {
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
        userId: user.user_id,
        username: user.username,
        email: user.email,
        // roleName: user.role.role_name,
        roleName: user.role.roleName,
        // roleType: user.role.role_type,
        roleType: user.role.roleType,
        ipAddress,
        deviceType,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      await this.sessionService.createSession(
        `session:${user.user_id}:${deviceType}`,
        accessToken,
        900,
      );

      return {
        accessToken,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error logging in user',
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
      /*
       * TODO:
       * Validate User Password ✅
       * Validate User Is Banned Or Not ✅
       * Validate Active Session ✅
       * Validate Failed Login
       * */

      const isPasswordValid = await this.validateUserPassword(password, user);
      if (!isPasswordValid) {
        // TODO: Add failed login logic log
        throw new UnauthorizedException('Invalid password');
      }

      if (!user.active) {
        throw new UnauthorizedException('User is already banned !!');
      }

      const isSessionValid = await this.validateUserSession(
        user.user_id,
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

  private async validateUsernameEmail(username: string, email: string) {
    const [userByUsername, userByEmail] = await Promise.all([
      this.userService.getUserByUsername(username),
      this.userService.getUserByEmail(email),
    ]);

    if (userByUsername) {
      throw new BadRequestException('Username already exists');
    }

    if (userByEmail) {
      throw new BadRequestException('Email already exists');
    }
  }
}
