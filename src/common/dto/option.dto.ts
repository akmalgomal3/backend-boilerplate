import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class OptionDTO {
    @ApiProperty({ example: '5ce865a6-e419-4f77-9b0f-0377900f4342' })
    @IsString()
    @IsOptional()
    key?: string

    @ApiProperty({ example: 'Admin' })
    @IsNotEmpty()
    value: string | number
}