import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { JwtPayload } from "src/common/types/jwt-payload.type";
import { CreateUserLogActivityDTO } from "src/user_log_activities/dto/create_user_log_activity.dto";
import { ActivityType } from "src/user_log_activities/enum/user_log_activities.enum";
import { UserLogActivitiesService } from "src/user_log_activities/service/user_log_activities.service";
import { AuthorizeUserType } from "src/users/types/authorize_user.type";

@Injectable()
export class UserLogAcitivitiesInterceptor implements NestInterceptor{
    /** 
        TO DO: 
        - User data is not dinamic
        - Mapping Message ONLY for auth 
        - Handle user activity for error
    */ 
    constructor(
        private readonly userLogActivitiesService: UserLogActivitiesService
    ){}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any>{
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        let user: JwtPayload = req?.user
        const method = req.method
        const path = req?.route?.path

        const page = this.userLogActivitiesService.mappingPageActivity(path)
        const activityType = page.includes("auth") ? ActivityType.AUTH : ActivityType.ACTIVITY
        
        return next.handle().pipe(
            tap(async (data) => {
                console.log(page);
                if(page.includes("register")){
                    user = data?.data
                } else if (page.includes("login")){
                    user = req.body
                }

                const userLogActivity :CreateUserLogActivityDTO = {
                    user_id: user?.userId, 
                    username: user?.username,
                    device: {
                        type: user?.deviceType, 
                        info: {
                            ip_address: user?.ipAddress,
                            latitude: user?.latitude,
                            longitude: user?.longitude
                        }
                    },
        
                    method: method, 
                    path: req?.url, 
                    status_code: data?.statusCode || res.statusCode || HttpStatus.OK,
                    activity_type: activityType,
                    description: this.userLogActivitiesService.mappingDescriptionActivity(user.username, method, page), 
                    timestamp: new Date()
                }

                if(page.toLowerCase() === "login"){
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