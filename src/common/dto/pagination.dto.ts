import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
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
}

export class PaginatedResponseDto<T> {
  data: T[];
  metadata: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}
