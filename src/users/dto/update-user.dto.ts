import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty } from "class-validator";
import { OptionDTO } from "src/common/dto/option.dto";

export class UpdateUserDto {
    userId?: string

    @ApiProperty({ example: 'akmaliatrias202' })
    readonly username?: string | null;
 
    @ApiProperty({ example: 'akmalia trias trias' })
    readonly fullName?: string| null;

    @ApiProperty({ example: '2024-05-20' })
    readonly birthdate?: string | null;


    @ApiProperty({ example: {key: '5ce865a6-e419-4f77-9b0f-0377900f4342', value: "Admin"}})
    readonly role?: OptionDTO;

    updatedBy?: string
}
  