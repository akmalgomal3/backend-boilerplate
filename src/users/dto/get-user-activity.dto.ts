import {
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoles } from '../../common/enums/user.enum';

export class GetUserActivityDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @IsEnum(UserRoles)
  @IsOptional()
  userRole: UserRoles;

  @IsEnum(['failed', 'success'])
  @IsOptional()
  status: 'failed' | 'success';

  @IsDate()
  @IsOptional()
  dateFrom: Date;

  @IsDate()
  @IsOptional()
  dateTo: Date;
}
