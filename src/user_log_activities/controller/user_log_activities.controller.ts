import { Body, Controller, Delete, Get, HttpException, HttpStatus, ParseBoolPipe, Post, Query, Req } from '@nestjs/common';
import { UserLogActivitiesService } from '../service/user_log_activities.service';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ConfigService } from '@nestjs/config';
import { config } from 'process';

@Controller('/user-log-activities')
export class UserLogActivitiesController {
    constructor(
        private userLogActivitiesService: UserLogActivitiesService,
    ){}

    @Post()
    async create(@Body() createUserLogActivity: CreateUserLogActivityDTO){
        const result = await this.userLogActivitiesService.create(createUserLogActivity)
        return { data: result }
    }

    @Get()
    async getUserActivityDescription(@Req() req: any, @Query('description') description: string ){
        const user = req?.user
        return {
            data: await this.userLogActivitiesService.getUserActivityByDescription(user?.userId, description)
        }
    }

    @Delete()
    async deleteUserActivityDescription(@Req() req: any, @Query('description') description: string ){
        const user = req?.user
        return {
            data: await this.userLogActivitiesService.deleteUserActivityByDescription(user?.userId, description)
        }
    }
}
