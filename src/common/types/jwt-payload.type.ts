import { RoleType } from '../enums/user-roles.enum';

export type JwtPayload = {
  userId: string;
  username: string;
  email: string;
  roleName: string;
  roleType: RoleType;
  ipAddress: string;
  deviceType: string;
};
