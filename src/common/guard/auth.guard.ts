import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import { SessionService } from '../../libs/session/service/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const token: string = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException('Invalid bearer token', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      const tokenInRedis = await this.sessionService.getSession(
        `session:${payload.userId}:${payload.deviceType}`,
      );

      if (!tokenInRedis || token !== tokenInRedis) {
        throw new HttpException(
          'Auth: Token expired or invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.sessionService.updateExpire(
        `session:${payload.userId}:${payload.deviceType}`,
        900,
      );

      request['user'] = payload;
    } catch (e) {
      throw new HttpException(e.message || 'Unauthorized', e.status || 401);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
