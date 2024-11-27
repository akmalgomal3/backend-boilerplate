import { DeviceType, UserRoles } from '../enums/user.enum';

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRoles;
  session_id: string;
  device_type: DeviceType;
};
