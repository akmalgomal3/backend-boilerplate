import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../../common/enums/device-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: '139.255.255.242',
  })
  @IsNotEmpty()
  @IsString()
  ipAddress: string;

  @ApiProperty({
    enum: DeviceType,
    example: DeviceType.MOBILE,
  })
  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;

  @ApiProperty({
    example: 'kurniawan101',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'U2FsdGVkX1/gocVugyRay89B+O3G1YsjNNCk97m5YwY=',
    description: 'Encrypted password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
