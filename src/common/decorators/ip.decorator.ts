import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IpType } from '../types/ip.type';

export const Ip = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IpType => {
    const request = ctx.switchToHttp().getRequest();
    const ipAddress = request['ip-address'];
    const userAgent = request.headers['user-agent'];

    return {
      'ip-address': ipAddress,
      'user-agent': userAgent,
    };
  },
);
