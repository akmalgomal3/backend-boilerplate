import { UpdateUserDto } from './update-user.dto';
import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateUserDto {
  @ApiProperty({ type: [UpdateUserDto] })
  @IsNotEmpty()
  @IsArray()
  users: UpdateUserDto[];
}
