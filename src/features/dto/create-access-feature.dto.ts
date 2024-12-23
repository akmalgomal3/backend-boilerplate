import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAccessFeatureDto {
  createdBy?: string;

  updatedBy?: string;

  @ApiProperty({ example: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1' })
  @IsNotEmpty()
  @IsUUID()
  featureId: string;

  @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  canAccess: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  canRead: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canUpdate: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canDelete: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  canInsert: boolean;
}
