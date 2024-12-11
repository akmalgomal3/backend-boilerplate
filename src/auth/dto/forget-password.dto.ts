import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({ example: 'iqbal@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
