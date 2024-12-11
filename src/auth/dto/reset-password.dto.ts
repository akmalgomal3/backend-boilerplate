import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;

  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted Password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'U2FsdGVkX1+bK5wwBHWqAoDYH3regha856gOXPyWE94=',
    description: 'Encrypted Confirm Password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
