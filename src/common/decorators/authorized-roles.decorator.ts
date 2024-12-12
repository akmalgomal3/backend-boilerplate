import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enums/user-roles.enum';

export const ROLES_KEY = 'roles';
export const AuthorizedRoles = (...roles: RoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
