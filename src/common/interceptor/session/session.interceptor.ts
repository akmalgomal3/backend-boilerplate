import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';
import { SessionService } from '../../../libs/session/services/session.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { JwtPayload } from '../../types/jwt-payload.type';
import { UtilsService } from '../../utils/services/utils.service';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
    private readonly utils: UtilsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    console.log(request['log-data']);

    if (isPublic) {
      return next.handle();
    }
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
        console.log('ENTER SESSION INTERCEPTOR AFTER');
        this.sessionService.updateSessionLastActivity(activeSession.id);
      }),
    );
  }
}
