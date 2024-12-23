import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateFeatureDto {
  @ApiProperty({ example: 'feature global' })
  @IsNotEmpty()
  @IsString()
  featureName: string;

  @ApiProperty({ example: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1' })
  menuId: string;

  @ApiProperty({ example: 'feature global maps' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active?: boolean;
}
