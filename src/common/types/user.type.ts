import { Users } from '../../users/entity/user.entity';
import { Sessions } from '../../libs/session/entity/session.entity';

export type UserWithSessions = Users & { sessions: Sessions[] };

export type SessionWithUser = Sessions & { user: Users };
