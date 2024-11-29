import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoles } from '../../common/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

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
    example: UserRoles.Admin,
    description: 'User Role',
    enum: UserRoles,
    required: false,
  })
  @IsEnum(UserRoles)
  @IsOptional()
  userRole: UserRoles;

  @ApiProperty({
    example: 'success',
    description: 'Status of the activity',
    enum: ['failed', 'success'],
    required: false,
  })
  @IsEnum(['failed', 'success'])
  @IsOptional()
  status: 'failed' | 'success';

  @ApiProperty({
    example: '2021-01-01',
    description: 'Date from',
    required: false,
  })
  @IsOptional()
  dateFrom: string;

  @ApiProperty({
    example: '2021-01-01',
    description: 'Date to',
    required: false,
  })
  @IsOptional()
  dateTo: string;
}
