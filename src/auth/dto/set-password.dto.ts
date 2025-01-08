import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    example: 'U2FsdGVkX1/gocVugyRay89B+O3G1YsjNNCk97m5YwY=',
    description: 'Encrypted Password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'U2FsdGVkX19fF/O+QynfDl++NBPAD+KEgySp1ALIAq0=',
    description: 'Encrypted Confirm Password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: 'U2FsdGVkX19fF/O+QynfDl++NBPAD+KEgySp1ALIAq0=',
    description: 'Token in forget password URL',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
