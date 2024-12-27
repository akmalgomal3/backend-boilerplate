import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsUUID } from "class-validator";
export class CreateUpdateBulkAccessMenuDto{
    createdBy?: string
    updatedBy?: string

    @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
    @IsNotEmpty()
    @IsUUID()
    roleId: string;

    @IsNotEmpty()
    @IsArray()
    @ApiProperty({ example: [], description: 'Array of menuId' })
    menus: CreateAccessMenuDto[];
}

export class CreateAccessMenuDto{
    menuId: string;
    selected: boolean;
    parentMenuId?: string;
    hierarchyLevel?: number;
    children?: CreateAccessMenuDto[];
}