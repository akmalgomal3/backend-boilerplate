import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveUserAuthDto {
  @ApiProperty({ example: 'c52442dc-59fe-487d-aaeb-580b0695061e' })
  @IsNotEmpty({ message: 'userAuthId must be defined' })
  @IsUUID('all', { message: 'userAuthId must be an UUID' })
  roleId: string;

  @ApiProperty({ example: 'c52442dc-59fe-487d-aaeb-580b0695061e' })
  @IsNotEmpty({ message: 'userAuthId must be defined' })
  @IsUUID('all', { message: 'userAuthId must be an UUID' })
  userAuthId: string;
}
