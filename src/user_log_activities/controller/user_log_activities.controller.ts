import { Body, Controller, Delete, Get, HttpException, HttpStatus, ParseBoolPipe, ParseEnumPipe, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { UserLogActivitiesService } from '../service/user_log_activities.service';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ActivityType } from '../enum/user_log_activities.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { AuthorizedRoles } from 'src/common/decorators/authorized-roles.decorator';
import { RoleType } from 'src/common/enums/user-roles.enum';

@Controller('/user-log-activities')
export class UserLogActivitiesController {
    constructor(
        private userLogActivitiesService: UserLogActivitiesService,
    ){}

    @ApiBearerAuth()
    @Get('/header/info')
    async getUserActivitiesHeaderInfo(){
        const result = this.userLogActivitiesService.getUserLogActivityHeader()
        return {
            data: result, 
        }
    }

    @ApiBearerAuth()
    @Post('/user')
    async getUserActivitiesLoggedInUser(
        @Req() req: any, 
        @Body() paginationDto: PaginationDto
    ){
        const user = req?.user
        const result = await this.userLogActivitiesService.getUserActivityCurrentUser(user.userId, paginationDto)
        return {
            statusCode: 200, 
            data: {
                body: result.data,
                sorts: paginationDto.sorts || [],
                filter: paginationDto.filters || [],
                search: paginationDto.search || [],
            },
            metadata: result.metadata
        }
    }

    @ApiBearerAuth()
    @Post('/logged-in')
    @AuthorizedRoles(RoleType.Admin)
    async getActivityLoggedInUsers(
        @Body() paginationDto: PaginationDto
    ){
        const result = await this.userLogActivitiesService.getUsersLoggedIn(paginationDto)
        return {
            statusCode: '200',
            data: {
                body: result.data,
                filter: paginationDto.filters || [],
                search: paginationDto.search || [],
            }, 
            metadata: result.metadata
        }
    }
}
