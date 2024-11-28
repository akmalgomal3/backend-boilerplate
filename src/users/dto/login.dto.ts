import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDTO {
    @ApiProperty({
        description: 'device_id get form the client',
        example: 'a92cc207-1382-4b87-8596-c17698293f17',
    })
    @IsNotEmpty()
    device_id: string


    @ApiProperty({
        description: 'can be email or username',
        example: 'admin',
    })
    @IsNotEmpty()
    usernameOrEmail: string

    @ApiProperty({
        description: 'Password user that being encrypted',
        example: 'U2FsdGVkX189ZmilIHgFCvAyaT1fajaH0zWff3omXxc=',
    })
    @IsNotEmpty()
    password: string
}