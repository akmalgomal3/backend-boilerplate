import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../../common/enums/device-type.enum';

export class LoginGoogleDto {
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
}
