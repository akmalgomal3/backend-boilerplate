import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateAccessMenuDto{
    createdBy?: string

    updatedBy?: string

    @ApiProperty({ example: '91ccec39-5616-4090-9372-87f08b877352' })
    @IsNotEmpty()
    @IsUUID()
    menuId: string;

    @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
    @IsNotEmpty()
    @IsUUID()
    roleId: string;
}