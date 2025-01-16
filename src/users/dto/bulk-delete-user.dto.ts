import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


class DeleteUserDto {
    @ApiProperty({ example: "60299a76-a2d2-4eb2-b1b5-057b295241ab" })
    @IsNotEmpty()
    userId: string
}

export class BulkDeleteUserDto {
  @ApiProperty({ type: [DeleteUserDto] })
  @IsNotEmpty()
  @IsArray()
  users: DeleteUserDto[];
}