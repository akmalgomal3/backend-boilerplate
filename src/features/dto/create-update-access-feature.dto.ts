import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUpdateBulkAccessFeatureDto {
  createdBy?: string;

  updatedBy?: string;

  @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: [] })
  @IsNotEmpty()
  @IsArray()
  globalFeatures: CreateUpdateAccessFeatureDto[];
  
  @ApiProperty({ example: [] })
  @IsNotEmpty()
  @IsArray()
  menus: CreateUpdateAccessFeatureByMenuDto[];
}

export class CreateUpdateAccessFeatureByMenuDto {
  menuId: string;
  parentMenuId?: string;
  hierarchyLevel?: number;
  children?: CreateUpdateAccessFeatureByMenuDto[];
  features: CreateUpdateAccessFeatureDto[]
}

export class CreateUpdateAccessFeatureDto {
  roleId?: string;
  createdBy?: string;
  featureId: string;
  canAccess: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canInsert: boolean;
}
