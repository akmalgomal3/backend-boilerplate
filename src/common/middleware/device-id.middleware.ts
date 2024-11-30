import { Injectable, NestMiddleware, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { isIP } from 'net'

@Injectable()
export class DeviceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const deviceId = req.headers['device-id'];
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!deviceId) {
      throw new BadRequestException('Device-ID is required');
    }

    if (!ipAddr) {
      throw new BadRequestException('IP-Address is required');
    }

    if (!this.isValidDeviceId(deviceId)) {
      throw new BadRequestException('Invalid Device-ID');
    }

    if (!this.isPublicIP(ipAddr)) {
      throw new BadRequestException(`Invalid public IP address: ${ipAddr}`);
    }

    // Pass the device-id to the request object
    (req as any).device_id = deviceId;
    (req as any).ip_address = ipAddr;
    next();
  }

  private isValidDeviceId(deviceId: string | string[]): boolean {
    if (typeof deviceId !== 'string') return false;
    return deviceId.length <= 36;
  }

  private isPublicIP(ip: string | string[]): boolean {
    if (typeof ip !== 'string') return false;

    if (!isIP(ip)) return false;
  
    // Regex for private IP ranges
    const privateIPv4 = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})$/;
    const privateIPv6 = /^(::1|fc00::|fd00::|fe80::)/;
  
    if (isIP(ip) === 4 && privateIPv4.test(ip)) return false; // IPv4 private
    if (isIP(ip) === 6 && privateIPv6.test(ip)) return false; // IPv6 private
  
    return true; // It's a public IP
  }
}
