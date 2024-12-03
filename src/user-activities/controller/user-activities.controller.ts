import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { UserActivitiesService } from '../service/user-activities.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';

@ApiBearerAuth()
@Controller('/v1/user-activity')
@UseInterceptors(ResponseInterceptor)
export class UserActivityController {
    constructor(
        private userActivitiesService: UserActivitiesService
    ){}
    
    @Get()
    async getUserActivity(
        @Query('page') page: number,
        @Query('limit') limit: number, 
        @Query('action') action: string, 
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ){
        const result = await this.userActivitiesService.getLogs({ page, limit }, {action, startDate, endDate})
        return {
            metadata: result.metadata,
            data: result.data,
        };
    }
}
