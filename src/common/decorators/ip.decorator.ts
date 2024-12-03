import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IpType } from '../types/ip.type';
import { DeviceType } from '../enums/user.enum';

export const Ip = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IpType => {
    const request = ctx.switchToHttp().getRequest();
    const ipAddress = request['ip-address'];
    const userAgent = request.headers['user-agent'];

    const regex =
      /Mobi|Android|iOS|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    const deviceType: DeviceType = regex.test(userAgent)
      ? DeviceType.mobile
      : DeviceType.web;

    return {
      'ip-address': ipAddress,
      'user-agent': userAgent,
      'device-type': deviceType,
    };
  },
);
