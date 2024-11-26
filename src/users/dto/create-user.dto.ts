import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, IsStrongPassword, IsUUID, MaxLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Role ID',
        example: 'fa93d2d3-4011-401b-a367-9cbac525cf58',
    })
    @IsNotEmpty()
    @IsUUID()
    role_id: string; 

    @ApiProperty({
        description: 'Full name user',
        example: 'Akmalia Trias',
    })
    @IsNotEmpty()
    full_name: string; 
    
    @ApiProperty({
        description: 'Email user',
        example: 'admin@ntx.solution.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string; 

    @ApiProperty({
        description: 'Username user',
        example: 'admin',
    })
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Password user that being encrypted',
        example: 'U2FsdGVkX189ZmilIHgFCvAyaT1fajaH0zWff3omXxc=',
    })
    @IsNotEmpty()
    @IsString()
    // @MaxLength(12)
    // @IsStrongPassword({
    //     minLength: 8,
    //     minLowercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1,
    //     minUppercase: 1
    // })
    password: string; 

    @ApiProperty({
        description: 'Is the account is dev',
        example: true,
    })
    @IsBoolean()
    is_dev: boolean
}