import { Body, Controller, Get, HttpException, HttpStatus, ParseBoolPipe, Post, Query } from '@nestjs/common';
import { UserLogActivitiesService } from '../service/user_log_activities.service';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ConfigService } from '@nestjs/config';
import { config } from 'process';

@Controller('/v1/user-log-activities')
export class UserLogActivitiesController {
    constructor(
        private userLogActivitiesService: UserLogActivitiesService,
    ){}

    @Post()
    async create(@Body() createUserLogActivity: CreateUserLogActivityDTO){
        const result = await this.userLogActivitiesService.create(createUserLogActivity)
        return result
    }

    @Get()
    async getAll(
        @Query('isBanned', ParseBoolPipe) isBanned: string
    ){
        if(isBanned){
            throw new HttpException("error get all", HttpStatus.BAD_REQUEST)
        }
        
        return { data: 'success' }
    }
}
