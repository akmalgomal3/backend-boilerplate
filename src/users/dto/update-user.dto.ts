import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    userId?: string

    @ApiProperty({ example: 'akmaliatrias202' })
    readonly username?: string;
 
    @ApiProperty({ example: 'akmalia trias trias' })
    readonly fullName?: string;

    @ApiProperty({ example: '2024-05-20' })
    readonly birthdate?: string;


    @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
    readonly roleId?: string;

    updatedBy?: string
}
  