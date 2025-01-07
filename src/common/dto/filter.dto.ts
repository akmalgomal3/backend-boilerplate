import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterDto {
  @ApiProperty({ example: 'roleName', description: 'Key of the filter' })
  @IsString()
  key: string;

  @ApiProperty({
    example: ['admin'],
    description: 'Value(s) for the filter, could be an array.',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  value: string[];

  @ApiProperty({
    example: '2024-12-12T09:49:00.092Z',
    description: 'Start date for the filter (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiProperty({
    example: '2024-12-12T09:49:00.092Z',
    description: 'End date for the filter (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end?: string;
}