import { DeviceType, UserRoles } from '../../common/enums/user.enum';

export type LoginUserResponseType = {
  id: string;
  email: string;
  username: string;
  role: UserRoles;
  deviceType: DeviceType;
  lastActivity: Date;
  expiresAt: Date;
};
