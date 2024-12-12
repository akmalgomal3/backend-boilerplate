import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { CreateUserLogActivityDTO } from "src/user_log_activities/dto/create_user_log_activity.dto";
import { ActivityType } from "src/user_log_activities/enum/user_log_activities.enum";
import { UserLogActivitiesService } from "src/user_log_activities/service/user_log_activities.service";
import { AuthorizeUserType } from "src/users/types/authorize_user.type";

@Injectable()
export class UserLogAcitivitiesInterceptor implements NestInterceptor{
    constructor(
        private readonly userLogActivitiesService: UserLogActivitiesService
    ){}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any>{
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        const user: AuthorizeUserType = req?.user
        const method = req.method
        const path = req.url
        
        const activityType = path.includes("auth") ? ActivityType.AUTH : ActivityType.ACTIVITY
        const isLogin = path.includes("auth") && path.includes("login") 

        return next.handle().pipe(
            tap(async (data) => {
                const userLogActivity :CreateUserLogActivityDTO = {
                    user_id: user?.id, 
                    username: user?.username,
                    device: {
                        type: user?.device_type, 
                        info: {
                            ip_address: user?.ip_address,
                            latitude: user?.latitude,
                            longitude: user?.longitude
                        }
                    },
        
                    method: method, 
                    path: path, 
                    status_code: data?.statusCode || res.statusCode || HttpStatus.OK,
                    activity_type: activityType,
                    description: this.userLogActivitiesService.mappingDescriptionActivity(method, path), 
                }

                if(isLogin){
                    userLogActivity.auth_details = {
                        login_time: new Date(), 
                        logout_time: null
                    }
                }

                await this.userLogActivitiesService.create(userLogActivity)
            }), 
        )

    }

}