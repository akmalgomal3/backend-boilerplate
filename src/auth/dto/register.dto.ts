import { UserRoles } from '../../common/enums/user.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'iqbal@gmail.com', description: 'Email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'iqbal123', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

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

  @ApiProperty({
    example: UserRoles.Admin,
    description: 'User Role',
    enum: UserRoles,
  })
  @IsEnum(UserRoles)
  @IsNotEmpty()
  role: UserRoles;
}
