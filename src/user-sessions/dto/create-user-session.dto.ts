import { IsString, IsDate, IsNotEmpty } from 'class-validator';

export class CreateUserSessionDto {
  @IsString()
  @IsNotEmpty()
  device_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  device_type: string;

  @IsDate()
  @IsNotEmpty()
  expired_at?: Date;

  @IsDate()
  @IsNotEmpty()
  last_activity_at?: Date;
}
