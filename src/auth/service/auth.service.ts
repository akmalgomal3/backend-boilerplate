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

      const hashedPassword = await bcrypt.hash(password, 10);

      const user: Users = await this.userService.createUser({
        email,
        username,
        password: hashedPassword,
        role,
      });

      return user;
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

    return password;
  }

  private decrypt(str: string): string {
    const bytes = CryptoJS.AES.decrypt(str, this.secretKey);

    return bytes.toString(CryptoJS.enc.Utf8);
  }

  generateEncryptedPassword(
    password: string,
    confirmPassword: string,
  ): object {
    const encryptedPassword: string = this.encrypt(password);
    const encryptedConfirmPassword: string = this.encrypt(confirmPassword);

    return {
      encryptedPassword,
      encryptedConfirmPassword,
    };
  }

  private encrypt(str: string): string {
    const encryptedPassword: string = CryptoJS.AES.encrypt(
      str,
      this.secretKey,
    ).toString();

    return encryptedPassword;
  }
}
