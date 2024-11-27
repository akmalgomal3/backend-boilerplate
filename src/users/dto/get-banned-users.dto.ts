import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetBannedUsersDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @IsEnum(['username', 'email', 'role'])
  @IsNotEmpty()
  orderBy: 'username' | 'email' | 'role' = 'username';

  @IsEnum(['desc', 'asc'])
  @IsNotEmpty()
  orderIn: 'desc' | 'asc' = 'asc';

  @IsOptional()
  @IsString()
  search?: string;
}
