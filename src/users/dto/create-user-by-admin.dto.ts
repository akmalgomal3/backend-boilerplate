import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { OptionDTO } from 'src/common/dto/option.dto';

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'kurniawan101' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Kurniawan Setiadi' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

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

  @ApiProperty({ example: 'kurniawan@gmail.com' })
  @IsEmail({}, { message: 'Please input valid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/, {
    message: 'Please input valid indonesian phone number',
  })
  phoneNumber: string;

  @ApiProperty({type: OptionDTO})
  @IsObject()
  @IsOptional()
  role?: OptionDTO;

  @ApiProperty({ example: '1996-11-10' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birthdate must be in YYYY-MM-DD format',
  })
  birthdate: string;
}