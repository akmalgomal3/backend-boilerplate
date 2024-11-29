import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/services/user.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import { UtilsService } from '../utils/services/utils.service';
import { SessionTimeoutException } from '../exceptions/http-exceptions.filter';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private userService: UserService,
    private utils: UtilsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      request['is-public'] = true;
      return true;
    }

    const token: string = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET') || 'thisshouldbeasecret',
      });

      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userService.getUser(payload.id);

      if (!user) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
      await this.utils.createLogData(context);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new SessionTimeoutException(
          'Your session has ended, please login again',
        );
      }
      throw new HttpException(e.message || 'Unauthorized', e.status || 401);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
