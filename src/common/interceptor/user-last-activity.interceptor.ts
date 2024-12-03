import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserSessionsService } from 'src/user-sessions/service/user-sessions.service';
import { GetUserDeviceType } from 'src/common/helper/user-device-type.helper'

@Injectable()
export class LastActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly userSessionService: UserSessionsService, 
    private readonly reflector: Reflector
) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const isPublic = this.reflector.get<boolean>('isPublic', handler);
    if (isPublic) {
        return next.handle();
    }

    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const deviceType = await this.getDeviceType(req);
    await this.userSessionService.updateLastActivity(user.id, deviceType);
    return next.handle();
  }

  private async getDeviceType(request: any): Promise<string> {
    return GetUserDeviceType(request)
  }
}
