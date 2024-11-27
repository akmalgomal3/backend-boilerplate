import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UtilsService {
  private secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  decrypt(str: string): string {
    const bytes = CryptoJS.AES.decrypt(str, this.secretKey);

    return bytes.toString(CryptoJS.enc.Utf8);
  }

  encrypt(str: string): string {
    return CryptoJS.AES.encrypt(str, this.secretKey).toString();
  }
}
