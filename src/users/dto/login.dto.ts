import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDTO {
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