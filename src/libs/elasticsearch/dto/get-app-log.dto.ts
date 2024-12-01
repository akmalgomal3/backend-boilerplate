import { UserRoles } from '../../../common/enums/user.enum';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetAppLogDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @IsNotEmpty()
  @IsIn(['user_auth', 'user_activity'])
  logType: 'user_auth' | 'user_activity';

  @IsEnum(UserRoles)
  @IsOptional()
  userRole: UserRoles;

  @IsEnum(['failed', 'success'])
  @IsOptional()
  status: 'failed' | 'success';

  @IsDate()
  @IsOptional()
  dateFrom: Date;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsDate()
  @IsOptional()
  dateTo: Date;

  @IsString()
  @IsOptional()
  search?: string;
}
