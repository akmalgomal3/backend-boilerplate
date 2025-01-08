import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted Old Password',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted New Password',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted Confirm Password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
