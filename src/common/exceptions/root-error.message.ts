import { AuthErrorMessage } from '../../auth/errors/auth-error.message';
import { UsersErrorMessage } from '../../users/errors/users-error.message';
import { UtilsErrorMessage } from '../../libs/utils/errors/utils-error.message';
import { RolesErrorMessage } from '../../roles/exception/roles.exceptions';
import { MenusErrorMessage } from '../../menus/exception/menus.exception';

export class ErrorMessages {
  static auth: AuthErrorMessage = new AuthErrorMessage();
  static users: UsersErrorMessage = new UsersErrorMessage();
  static utils: UtilsErrorMessage = new UtilsErrorMessage();
  static roles: RolesErrorMessage = new RolesErrorMessage();
  static menus: MenusErrorMessage = new MenusErrorMessage();
}
