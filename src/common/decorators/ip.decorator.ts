import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IpType } from '../types/ip.type';

export const Ip = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IpType => {
    const request = ctx.switchToHttp().getRequest();
    const ipPublic = request['ip-public'];
    const ipPrivate = request['ip-private'];

    return {
      'ip-private': ipPrivate,
      'ip-public': ipPublic,
    };
  },
);
