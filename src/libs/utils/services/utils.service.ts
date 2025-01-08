import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import * as geoip from 'geoip-lite';
import { ErrorMessages } from '../../../common/exceptions/root-error.message';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UtilsService {
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
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
    } else if (
      obj !== null &&
      typeof obj === 'object' &&
      !this.isInstanceOf(obj, Date)
    ) {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = this.snakeCase(key);
        acc[newKey] = this.camelToSnake(obj[key]);
        return acc;
      }, {});
    }

    return obj;
  }

  snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        item = item?._doc || item;
        return this.snakeToCamel(item);
      });
    } else if (
      obj !== null &&
      typeof obj === 'object' &&
      !this.isInstanceOf(obj, Date)
    ) {
      obj = obj?._doc || obj;
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = key == '_id' ? '_id' : this.camelCase(key);
        acc[newKey] = key == '_id' ? obj[key] : this.snakeToCamel(obj[key]);
        return acc;
      }, {});
    }

    return obj;
  }

  getGeoIp(ipAddress: string): { latitude: number; longitude: number } {
    const geo = geoip.lookup(ipAddress);

    if (geo) {
      return {
        latitude: geo.ll[0],
        longitude: geo.ll[1],
      };
    }

    return { latitude: 0, longitude: 0 };
  }

  validateStrongPassword(decryptedPassword: string) {
    try {
      if (decryptedPassword.length < 8 || decryptedPassword.length > 12) {
        throw new BadRequestException(
          ErrorMessages.utils.getMessage('INVALID_PASSWORD_LENGTH'),
        );
      }

      if (!/[A-Z]/.test(decryptedPassword)) {
        throw new BadRequestException(
          ErrorMessages.utils.getMessage('INVALID_PASSWORD_UPPERCASE'),
        );
      }

      if (!/[a-z]/.test(decryptedPassword)) {
        throw new BadRequestException(
          ErrorMessages.utils.getMessage('INVALID_PASSWORD_LOWERCASE'),
        );
      }

      if (!/\d/.test(decryptedPassword)) {
        throw new BadRequestException(
          ErrorMessages.utils.getMessage('INVALID_PASSWORD_NUMBER'),
        );
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(decryptedPassword)) {
        throw new BadRequestException(
          ErrorMessages.utils.getMessage('INVALID_PASSWORD_SPECIAL_CHARACTER'),
        );
      }
    } catch (e) {
      throw new HttpException(
        e.message || 'Error validating strong password',
        e.status || 500,
      );
    }
  }

  validateConfirmPassword(password: string, confirmPassword: string): string {
    const decryptedPassword: string = this.decrypt(password);
    const decryptedConfirmPassword: string = this.decrypt(confirmPassword);

    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException(
        ErrorMessages.utils.getMessage('PASSWORD_NOT_MATCH'),
      );
    }

    if (!password.startsWith('U2F')) {
      throw new BadRequestException(
        ErrorMessages.utils.getMessage('INVALID_PASSWORD_FORMAT'),
      );
    }

    if (!confirmPassword.startsWith('U2F')) {
      throw new BadRequestException(
        ErrorMessages.utils.getMessage('INVALID_PASSWORD_FORMAT'),
      );
    }

    this.validateStrongPassword(decryptedPassword);

    return decryptedPassword;
  }

  async getAllQuery(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
    tableName: string,
    repository: Repository<any>,
    joins: { table: string; alias: string; condition: string }[] = [],
  ): Promise<[any[], number]> {
    try {
      let query = repository.createQueryBuilder(tableName);

      joins.forEach((join) => {
        query = query.leftJoinAndMapMany(
          `${tableName}.${join.table}`,
          `${join.table}`,
          `${join.alias}`,
          join.condition,
        );
      });

      if (filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.start && filter.end) {
            query = query.andWhere(
              `${tableName}.${filter.key} BETWEEN :start AND :end`,
              { start: filter.start, end: filter.end },
            );
          } else {
            query = query.andWhere(
              `${tableName}.${filter.key} IN (:...values)`,
              {
                values: filter.value,
              },
            );
          }
        });
      }
      if (searchQuery) {
        const { query: searchText, searchBy } = searchQuery;
        searchBy.forEach((field: any) => {
          query = query.andWhere(`${tableName}.${field} ILIKE :search`, {
            search: `%${searchText}%`,
          });
        });
      }
      if (sorts.length > 0) {
        sorts.forEach((sort) => {
          query = query.addOrderBy(
            `${tableName}.${sort.key}`,
            sort.direction.toUpperCase(),
          );
        });
      }
      query = query.skip(skip).take(take);

      const [data, count] = await query.getManyAndCount();

      return [data, count];
    } catch (e) {
      throw e;
    }
  }
}
