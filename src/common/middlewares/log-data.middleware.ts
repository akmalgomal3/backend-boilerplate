import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UtilsService } from '../utils/services/utils.service';
import { getTime } from 'date-fns';
import { IpInfo } from '../types/ip.type';

@Injectable()
export class LogDataMiddleware implements NestMiddleware {
  constructor(private readonly utils: UtilsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.baseUrl === '/auth/login' || req.baseUrl === '/auth/register') {
      const ipPublic: string = req['ip-public'];
      const ipPrivate: string = req['ip-private'];

      const ipData: IpInfo = await this.utils.getIpInfo(ipPublic);

      const now = new Date();
      req['log-data'] = {
        user_id: '',
        user_role: '',
        username: '',
        method: req.method,
        path: req.baseUrl,
        log_type: 'user_auth',
        status: 'to be determined',
        activity: 'to be determined',
        timestamp: getTime(now),
        datetime: now,
        device_type: req.body.deviceType,
        ip_private: ipPrivate,
        ip_public: ipPublic,
        location: {
          lat: ipData.lat,
          lon: ipData.lon,
        },
        country: ipData.country,
        city: ipData.city,
        postal_code: ipData.zip,
        timezone: ipData.timezone,
      };
    }

    next();
  }
}
