import { AuthErrorMessage } from '../../auth/errors/auth-error.message';
import { UsersErrorMessage } from '../../users/errors/users-error.message';
import { UtilsErrorMessage } from '../../libs/utils/errors/utils-error.message';
import { RolesErrorMessage } from '../../roles/exception/roles.exceptions';
import { MenusErrorMessage } from '../../menus/exception/menus.exception';
import { FeaturesErrorMessage } from '../../features/exception/features.exception';
import { UserLogActivitiesErrorMessage } from 'src/user_log_activities/errors/user-log-activities-error.message';
import { OptionsErrorMessage } from '../../options/exception/options.exceptions';

export class ErrorMessages {
  static auth: AuthErrorMessage = new AuthErrorMessage();
  static users: UsersErrorMessage = new UsersErrorMessage();
  static utils: UtilsErrorMessage = new UtilsErrorMessage();
  static roles: RolesErrorMessage = new RolesErrorMessage();
  static menus: MenusErrorMessage = new MenusErrorMessage();
  static features: FeaturesErrorMessage = new FeaturesErrorMessage();
  static userLogActivities: UserLogActivitiesErrorMessage = new UserLogActivitiesErrorMessage();
  static options: OptionsErrorMessage = new OptionsErrorMessage();
}
