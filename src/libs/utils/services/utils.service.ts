import { HttpException, Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import * as geoip from 'geoip-lite';
import { result } from 'lodash';

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

  snakeCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  camelCase(key: string): string {
    return key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }
  
  isInstanceOf(val: any, type: Function): boolean {
    return val instanceof type;
  }
  
  camelToSnake(obj: any) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.camelToSnake(item));
    } else if (obj !== null && typeof obj === 'object' && !this.isInstanceOf(obj, Date)) {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = this.snakeCase(key);
        acc[newKey] = this.camelToSnake(obj[key])
        return acc;
      }, {});
    }
  
    return obj;
  }

  snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        item = item?._doc || item
        return this.snakeToCamel(item)
      });
    } else if (obj !== null && typeof obj === 'object' && !this.isInstanceOf(obj, Date)) {
      obj = obj?._doc || obj
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = key == '_id' ? '_id' : this.camelCase(key);
        acc[newKey] = key == '_id' ? obj[key] : this.snakeToCamel(obj[key])
        return acc;
      }, {});
    }
  
    return obj;
  }
  
  getGeoIp(ipAddress: string): {latitude: number, longitude: number}{
    const geo = geoip.lookup(ipAddress);

    if (geo) {
      return {
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      }
    }

    return {latitude: 0, longitude: 0}
  }
  
}
