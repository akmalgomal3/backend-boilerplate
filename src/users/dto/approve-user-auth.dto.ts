import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveUserAuthDto {
  @ApiProperty({ example: 'c52442dc-59fe-487d-aaeb-580b0695061e' })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
