import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsOptional, IsString, IsDateString } from 'class-validator';

export class SortDto {
  @ApiProperty({ example: 'roleName', description: 'Key of the sorting field' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'asc', description: 'Sort direction' })
  @IsString()
  direction: 'asc' | 'desc';
}