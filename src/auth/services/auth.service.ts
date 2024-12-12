import { HttpException, Injectable } from '@nestjs/common';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly utils: UtilsService) {}

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
}
