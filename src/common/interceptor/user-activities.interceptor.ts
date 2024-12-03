import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserActivities } from 'src/user-activities/schema/user-activities.schema';
import { GetUserDeviceType } from '../helper/user-device-type.helper';
import { UserActivitiesService } from 'src/user-activities/service/user-activities.service';
import { GetUserActionMapping } from '../helper/user-action-mapping.helper';
import { UserSessions } from 'src/user-sessions/schema/user-sessions.schema';
import { UserSessionsService } from 'src/user-sessions/service/user-sessions.service';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
    constructor(
        private readonly userActivitiesService: UserActivitiesService,
        private readonly userSessionService: UserSessionsService
    ){}

    private getDeviceTypeUser(req: Request): Promise<string> {
      return GetUserDeviceType(req);
    }
    
    private getAction(method: string, endpoint: string): string {
      const action = GetUserActionMapping(method, endpoint)
      return action
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    const userActivity : Partial<UserActivities> = {
        user_id: req?.user?.id || 'guest', 
        device_id: req.device_id || 'unknown', 
        endpoint: req.url, 
        method: req.method, 
        parameter: req.params,
        ip_address: req.ip_address,
        latitude: req.headers['latitude'] || 0, 
        longitude: req.headers['longitude'] || 0, 
        timestamp: new Date(), 
        action: this.getAction(req.method, req.url)
    }

    return next.handle().pipe(
      tap(async (data) => {
        userActivity.status = data?.statusCode || 200
        userActivity.message = data?.message || "success"
        userActivity.device_type = await this.getDeviceTypeUser(req)

        await this.userActivitiesService.logActivity(userActivity);
      }), 
      catchError(async (err) => {
        const errResponse = err?.response
        userActivity.status = errResponse?.statusCode || err.status || 500
        userActivity.message = errResponse?.message || "error"
        userActivity.device_type = await this.getDeviceTypeUser(req)
        
        await this.userActivitiesService.logActivity(userActivity);

        throw err
      }),
    );
  }

}
