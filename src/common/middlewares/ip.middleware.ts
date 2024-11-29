import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    req['ip-address'] =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    req['user-agent'] = req.headers['user-agent'];

    next();
  }
}
