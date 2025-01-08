import { Body, Controller, Delete, Get, HttpException, HttpStatus, ParseBoolPipe, ParseEnumPipe, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { UserLogActivitiesService } from '../service/user_log_activities.service';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ActivityType } from '../enum/user_log_activities.enum';

@Controller('/user-log-activities')
export class UserLogActivitiesController {
    constructor(
        private userLogActivitiesService: UserLogActivitiesService,
    ){}

    @Get('/user')
    async getUserActivitiesLoggedInUser(
        @Req() req: any, 
        @Query('page') page: number, 
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('activityType') activityType: ActivityType,
        @Query('startDate') startDate: Date, 
        @Query('endDate') endDate: Date, 
    ){
        const user = req?.user
        const result = await this.userLogActivitiesService.getUserActivityCurrentUser(user.userId, {page, limit, search, activityType, startDate, endDate})
        return {
            data: result.data, 
            metadata: result.metadata
        }
    }

    @Get('/logged-in')
    async getActivityLoggedInUsers(
        @Query('page') page: number, 
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('statusCode') statusCode: string,
        @Query('startDate') startDate: Date, 
        @Query('endDate') endDate: Date, 
    ){
        const result = await this.userLogActivitiesService.getUsersLoggedIn({page, limit, search, statusCode, startDate, endDate})
        return {
            data: result.data, 
            metadata: result.metadata
        }
    }
}
