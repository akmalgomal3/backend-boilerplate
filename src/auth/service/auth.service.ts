import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import * as CryptoJS from 'crypto-js';
import { Users } from '../../users/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private secretKey: string;
  private strongPassword: RegExp = new RegExp(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/,
  );

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  async register(registerDto: RegisterDto): Promise<Users> {
    try {
      const { email, username, role } = registerDto;
      const password: string = this.validatePassword(
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

      return this.userService.createUser({
        email,
        username,
        password: hashedPassword,
        role,
      });
    } catch (e) {
      throw e;
    }
  }

  private validatePassword(password: string, confirmPassword: string): string {
    const decryptedPassword: string = this.decrypt(password);
    const decryptedConfirmPassword: string = this.decrypt(confirmPassword);

    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException('Password does not match');
    }

    if (!this.strongPassword.test(decryptedPassword)) {
      throw new BadRequestException(
        'Password must be 8 to 12 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }

    return password;
  }

  private decrypt(str: string): string {
    const bytes = CryptoJS.AES.decrypt(str, this.secretKey);

    return bytes.toString(CryptoJS.enc.Utf8);
  }

  generateEncryptedPassword(password: string, confirmPassword: string): object {
    const encryptedPassword: string = this.encrypt(password);
    const encryptedConfirmPassword: string = this.encrypt(confirmPassword);

    return {
      encryptedPassword,
      encryptedConfirmPassword,
    };
  }

  private encrypt(str: string): string {
    return CryptoJS.AES.encrypt(str, this.secretKey).toString();
  }
}
