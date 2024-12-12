import { HttpException, Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UtilsService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  decrypt(str: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(str, this.secretKey);

      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error decrypting string',
        e.status || 500,
      );
    }
  }

  encrypt(str: string): string {
    return CryptoJS.AES.encrypt(str, this.secretKey).toString();
  }
}
