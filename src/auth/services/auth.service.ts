import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../users/services/user.service';
import * as bcrypt from 'bcrypt';
import { format } from 'date-fns';

@Injectable()
export class AuthService {
  private strongPassword: RegExp = new RegExp(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/,
  );

  constructor(
    private readonly utils: UtilsService,
    private readonly userService: UserService,
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
