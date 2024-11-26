import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class EncryptPasswordDTO{
    @ApiProperty({
        description: 'raw password',
        example: 'Admin123!',
    })
    @IsNotEmpty()
    password: string
}