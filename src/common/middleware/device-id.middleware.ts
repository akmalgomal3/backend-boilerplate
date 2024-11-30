import { Injectable, NestMiddleware, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DeviceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const deviceId = req.headers['device-id'];

    if (!deviceId) {
      throw new BadRequestException('Device-ID is required');
    }

    if (!this.isValidDeviceId(deviceId)) {
      throw new UnauthorizedException('Invalid Device-ID');
    }

    // Pass the device-id to the request object
    (req as any).device_id = deviceId;
    next();
  }

  private isValidDeviceId(deviceId: string | string[]): boolean {
    if (typeof deviceId !== 'string') return false;
    return deviceId.length <= 36;
  }
}
