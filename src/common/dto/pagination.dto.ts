import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';
import { FilterDto } from './filter.dto';
import { SortDto } from './sort.dto';
import { SearchDto } from './search.dto';

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

  @ApiProperty({
    example: [
      {
        key: 'roleName',
        value: ['admin'],
        start: '2024-12-12T09:49:00.092Z',
        end: '2024-12-12T09:49:00.092Z',
      },
    ],
    description: 'Filters applied to the query (optional)',
    type: [FilterDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  filters?: FilterDto[];

  @ApiProperty({
    example: [{ key: 'roleName', direction: 'asc' }],
    description: 'Sorting applied to the query (optional)',
    type: [SortDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  sorts?: SortDto[];

  @ApiProperty({
    example: [{ query: 'admin', searchBy: ['roleName', 'roleType'] }],
    description: 'Search query parameters (optional)',
    type: [SearchDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  search?: SearchDto[];
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
