import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'iqbal123',
    description: 'User identifier, email or username',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
