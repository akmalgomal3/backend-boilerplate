import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class IpMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    req['ip-private'] = req.connection.remoteAddress;
    req['ip-public'] = req.headers['x-forwarded-for'];

    if (Array.isArray(req['ip-private'])) {
      req['ip-private'] = req['ip-private'][0];
    }

    if (req['ip-private'] === '::1') {
      req['ip-private'] = '127.0.0.1';
    }

    if (req['ip-private'].includes('::ffff:')) {
      req['ip-private'] = req['ip-private'].split('::ffff:')[1];
    }

    if (req['ip-private'] === '127.0.0.1') {
      const { data: serverIp } = await axios.get('http://ip-api.com/json');

      req['ip-public'] = serverIp.query;
    }

    next();
  }
}
