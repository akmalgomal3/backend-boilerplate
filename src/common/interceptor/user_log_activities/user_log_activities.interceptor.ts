import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { JwtPayload } from "src/common/types/jwt-payload.type";
import { CreateUserLogActivityDTO } from "src/user_log_activities/dto/create_user_log_activity.dto";
import { CreateUserLogActivityByUserDTO } from "src/user_log_activities/dto/create_user_log_activity_by_user.dto";
import { ActivityType } from "src/user_log_activities/enum/user_log_activities.enum";
import { UserLogActivitiesService } from "src/user_log_activities/service/user_log_activities.service";
import { UserService } from "src/users/services/user.service";
import { AuthorizeUserType } from "src/users/types/authorize_user.type";

@Injectable()
export class UserLogAcitivitiesInterceptor implements NestInterceptor{
    constructor(
        private readonly userLogActivitiesService: UserLogActivitiesService,
    ){}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any>{
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        let user: JwtPayload = req?.user
        const url = req?.url

        return next.handle().pipe(
            tap(async (data) => {
                if(url.includes("register")){
                    user = data?.data
                } else if (url.includes("login")){
                    user = req.body
                }

                const userLogActivity :CreateUserLogActivityByUserDTO = {
                    method: req.method, 
                    url, 
                    path: req?.route?.path,
                    statusCode: data?.statusCode || res.statusCode || HttpStatus.OK,
                    params: req?.params
                }

                await this.userLogActivitiesService.createByUser(user, userLogActivity)
            }), 
        )

    }

}