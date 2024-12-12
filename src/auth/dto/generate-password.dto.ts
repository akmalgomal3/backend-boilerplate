import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePasswordDto {
  @ApiProperty({ example: 'Test!234' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'Test!234' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
