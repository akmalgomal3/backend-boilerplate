import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IpType } from '../types/ip.type';

export const Ip = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IpType => {
    const request = ctx.switchToHttp().getRequest();
    const ipPublic = request['ip-public'];
    let ipPrivate = request['ip-private'];

    if (Array.isArray(ipPrivate)) {
      ipPrivate = ipPrivate[0];
    }

    if (ipPrivate === '::1') {
      ipPrivate = '127.0.0.1';
    }

    if (ipPrivate.includes('::ffff:')) {
      ipPrivate = ipPrivate.split('::ffff:')[1];
    }

    return {
      'ip-private': ipPrivate,
      'ip-public': ipPublic,
    };
  },
);
