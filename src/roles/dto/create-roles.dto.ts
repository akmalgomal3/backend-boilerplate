import { RoleType } from '../../common/enums/user-roles.enum';

export class CreateRoleDto {
  roleType: RoleType;
  roleName: string;
  createdBy?: string;
}
