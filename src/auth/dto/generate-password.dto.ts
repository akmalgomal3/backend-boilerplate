import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Test!234', description: 'Password' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Test!234', description: 'confirm password' })
  confirmPassword: string;
}
