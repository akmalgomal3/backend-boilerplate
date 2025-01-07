import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsOptional, IsString, IsDateString } from 'class-validator';

export class SearchDto {
  @ApiProperty({ example: 'admin', description: 'Search query' })
  @IsString()
  query: string;

  @ApiProperty({
    example: ['roleName', 'roleType'],
    description: 'Fields to search in',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  searchBy: string[];
}