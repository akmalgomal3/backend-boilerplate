import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../../common/enums/user.enum';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;
}
