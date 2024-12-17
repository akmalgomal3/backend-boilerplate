import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateBanUserDto{
    @ApiProperty({ 
        example: true, 
        description: 'set active or  not active for user', 
    })
    @IsNotEmpty()
    @IsBoolean()
    readonly active?: boolean;
}