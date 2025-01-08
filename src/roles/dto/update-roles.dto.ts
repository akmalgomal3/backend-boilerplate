import { RoleType } from '../../common/enums/user-roles.enum';

export class UpdateRoleDto {
  roleType?: RoleType;
  roleName: string;
  updatedBy?: string;
}
