import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { SessionService } from '../../../libs/session/services/session.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { JwtPayload } from '../../types/jwt-payload.type';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    const activeSession = await this.sessionService.getUserActiveSession(
      user.id,
      user.device_type,
    );

    if (!activeSession || activeSession.id !== user.session_id) {
      await this.sessionService.deleteUnusedSessions(user.id, user.device_type);
      throw new HttpException(
        {
          message: 'Your session is timeout, please login again',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return next.handle().pipe(
      tap(() => {
        this.sessionService.updateSessionLastActivity(activeSession.id);
      }),
    );
  }
}
