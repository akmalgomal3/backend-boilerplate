import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IpInfo } from '../../types/ip.type';
import { JwtPayload } from '../../types/jwt-payload.type';
import { getTime } from 'date-fns';
import { CreateLogDto } from '../../../libs/elasticsearch/dto/create-log.dto';
import { ElasticsearchService } from '../../../libs/elasticsearch/services/elasticsearch.service';

@Injectable()
export class UtilsService {
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly elasticClient: ElasticsearchService,
  ) {
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

  async createLogData(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const now = new Date();
    const user: JwtPayload = request.user;
    const ipAddress: string = request['ip-address'];
    const userAgent: string = request['user-agent'];

    const ipData: IpInfo = await this.getIpInfo(ipAddress);
    request['log-data'] = {
      user_id: user.id,
      user_role: user.role,
      username: user.username,
      method: request?.method,
      path: request?.route?.path,
      log_type: 'user_activity',
      status: 'to be determined',
      activity: `User ${user.username} has access the ${request?.route?.path} route`,
      timestamp: getTime(now),
      datetime: now,
      device_type: user.device_type,
      ip_address: ipAddress,
      user_agent: userAgent,
      location: {
        lat: ipData?.lat,
        lon: ipData?.lon,
      },
      country: ipData?.country,
      city: ipData?.city,
      postal_code: ipData?.zip,
      timezone: ipData?.timezone,
    };
  }

  async createUserActivityLog(log: CreateLogDto): Promise<void> {
    try {
      await this.elasticClient.createLog(log);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error creating user activity',
        e.status || 500,
      );
    }
  }
}
