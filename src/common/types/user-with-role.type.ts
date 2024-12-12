import { Users } from '../../users/entity/user.entity';
import { Roles } from '../../roles/entity/roles.entity';

export interface UserWithRole extends Users {
  role: Roles;
}
