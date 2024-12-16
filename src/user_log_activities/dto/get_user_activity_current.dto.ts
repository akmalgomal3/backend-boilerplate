import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '../enum/user_log_activities.enum';
  
  export class GetUserActivityDto {
    @ApiProperty({ example: 1, description: 'Page', default: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;
  
    @ApiProperty({ example: 10, description: 'Limit data per page', default: 10 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    limit: number = 10;

    @ApiProperty({
      example: 201,
      description: 'User log activity status code',
      required: false,
    })
    statusCode?: string;

    @ApiProperty({
        example: ActivityType.ACTIVITY,
        description: 'User log activity type',
        enum: ActivityType,
        required: false,
    })
    @IsEnum(ActivityType)
    activityType?: ActivityType;
  
    @ApiProperty({
      example: 'viewed',
      description: 'Description or username of user activity',
      required: false,
    })
    search?: string;
  
    @ApiProperty({
      example: '2024-12-15',
      description: 'Start date',
      required: false,
    })
    @IsDate()
    startDate?: Date;
  
    @ApiProperty({
        example: '2024-12-16',
        description: 'End date',
        required: false,
    })
    @IsDate()
    endDate?: Date;
  }
  