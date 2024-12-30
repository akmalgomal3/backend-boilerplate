import { RoleType } from '../../common/enums/user-roles.enum';

export const ERROR_MESSAGES_ROLES = {
  // Get All Roles
  ERROR_GET_ALL_ROLES: 'Error get all roles',

  // Get Role By Id
  ERROR_GET_ROLE_BY_ID_NOT_FOUND(roleId: string): string {
    return `Role with ID ${roleId} not found`;
  },
  ERROR_GET_ROLE_BY_ID: 'Error get role by id',

  // Get Role By Name
  ERROR_GET_ROLE_BY_NAME_NOT_FOUND(roleName: string): string {
    return `Role with name ${roleName} not found`;
  },
  ERROR_GET_ROLE_BY_NAME: 'Error get role by name',

  // Create Role
  ERROR_CREATE_ROLE_ALREADY_AVAILABLE(roleName: string): string {
    return `Role with name ${roleName} already available!`;
  },
  ERROR_CREATE_ROLE_TYPE_INVALID(roleType: RoleType): string {
    return `Role with type ${roleType} not valid!`;
  },
  ERROR_CREATE_ROLE: 'Error create new role',

  // Update Role
  ERROR_UPDATE_ROLE_NOT_FOUND(roleId: string): string {
    return `Role with ID ${roleId} not exist!`;
  },
  ERROR_UPDATE_ROLE_ALREADY_AVAILABLE(roleName: string): string {
    return `Role with name ${roleName} already available!`;
  },
  ERROR_UPDATE_ROLE_TYPE_INVALID(roleType: RoleType): string {
    return `Role with type ${roleType} not valid!`;
  },
  ERROR_UPDATE_ROLE: 'Error update role',

  // Delete Role
  ERROR_DELETE_ROLE_NOT_EXIST(roleId: string): string {
    return `Role with ID ${roleId} not exist!`;
  },
  ERROR_DELETE_ROLE: `Error delete role`,

  // Base Role
  ERROR_GETTING_BASE_ROLE: 'Error getting base role',
};
