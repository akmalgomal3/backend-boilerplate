import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class LogoutByAdminDto {
  @ApiProperty({ example: 'c52442dc-59fe-487d-aaeb-580b0695061e' })
  @IsNotEmpty({ message: 'userId must be defined' })
  @IsUUID('all', { message: 'userId must be an UUID' })
  userId: string;
}
