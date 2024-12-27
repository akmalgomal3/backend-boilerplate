import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordByAdminDto {
  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted New Password',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    description: 'Encrypted Confirm New Password',
  })
  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
