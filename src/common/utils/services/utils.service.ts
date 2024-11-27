import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IpInfo } from '../../types/ip.type';

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

  async getIpInfo(ip: string): Promise<IpInfo> {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);

    return data;
  }
}
