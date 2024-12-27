import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserAuthRequestType } from '../../common/enums/request-type.enum';

export class GetUserAuthDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Type((): NumberConstructor => Number)
  page: number = 10;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  @Type((): NumberConstructor => Number)
  limit: number;

  @ApiProperty({ example: 'kurniawan', required: false })
  @IsOptional()
  search: string;

  @ApiProperty({
    enum: UserAuthRequestType,
    example: UserAuthRequestType.Approved,
    required: false,
  })
  @IsEnum(UserAuthRequestType)
  @IsOptional()
  requestType?: UserAuthRequestType;

  @ApiProperty({ example: 'DESC' })
  @IsNotEmpty()
  @IsIn(['DESC', 'ASC'])
  sortByDate: 'DESC' | 'ASC' = 'DESC';
}
