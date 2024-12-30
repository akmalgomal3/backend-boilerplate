import { AuthErrorMessage } from '../../auth/errors/auth-error.message';
import { UsersErrorMessage } from '../../users/errors/users-error.message';
import { UtilsErrorMessage } from '../../libs/utils/errors/utils-error.message';

export class ErrorMessages {
  static auth: AuthErrorMessage = new AuthErrorMessage();
  static users: UsersErrorMessage = new UsersErrorMessage();
  static utils: UtilsErrorMessage = new UtilsErrorMessage();
}
