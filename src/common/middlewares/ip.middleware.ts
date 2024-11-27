import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['ip-private'] = req.connection.remoteAddress;
    req['ip-public'] = req.headers['x-forwarded-for'];
    next();
  }
}
