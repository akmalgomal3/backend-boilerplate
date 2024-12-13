import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.type';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();

    return request['user'];
  },
);
