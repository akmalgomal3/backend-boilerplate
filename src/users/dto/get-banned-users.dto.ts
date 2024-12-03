import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetBannedUsersDto {
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
    example: 'username',
    description: 'Order by only username, email, or role',
    default: 'username',
  })
  @IsEnum(['username', 'email', 'role'])
  @IsNotEmpty()
  orderBy: 'username' | 'email' | 'role' = 'username';

  @ApiProperty({
    example: 'asc',
    description: 'Order in',
    default: 'asc',
  })
  @IsEnum(['desc', 'asc'])
  @IsNotEmpty()
  orderIn: 'desc' | 'asc' = 'asc';

  @ApiProperty({
    example: 'iqbal123',
    description: 'search by username or email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
