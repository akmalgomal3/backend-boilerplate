import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import apm from 'elastic-apm-node';

@Injectable()
export class ApmMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const transaction = apm.startTransaction(`${req.method} ${req.url}`, 'request');
    res.on('finish', () => {
      if (transaction) {
        apm.addLabels({
          statusCode: res.statusCode,
          message: 'HTTP request completed',
        });

        console.log(`Transaction for ${req.url} finished with status ${res.statusCode}`);

        transaction.result = res.statusCode.toString();
        transaction.end();
      }
    });
    next();
  }
}
