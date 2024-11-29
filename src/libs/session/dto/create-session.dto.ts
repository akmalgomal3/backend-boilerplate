import { DeviceType } from '../../../common/enums/user.enum';

export class CreateSessionDto {
  userId: string;
  lastActivity: Date;
  expiresAt: Date;
  type: DeviceType;
  ipAddress?: string;
  user_agent?: string;
}
