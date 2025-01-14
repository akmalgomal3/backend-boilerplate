import { BaseErrorMessages } from '../../common/exceptions/base-error.message';

export class MenusErrorMessage extends BaseErrorMessages {
  messages = {
    ERROR_GET_ALL_MENU: 'Error get all menu',
    ERROR_GET_MENU_BY_ID_NOT_FOUND: 'Menu with ID ${menuId} not found',
    ERROR_GET_MENU_BY_ID: 'Error get menu by id',
    ERROR_GET_MENU_BY_NAME_NOT_FOUND: 'Menu with name ${menuName} not found',
    ERROR_GET_MENU_BY_NAME: 'Error get menu by name',
    ERROR_CREATE_MENU_PARENT_NOT_FOUND: 'Menu with id ${menuId} not exist!',
    ERROR_CREATE_MENU: 'Error create menu',
    ERROR_UPDATE_MENU_NOT_FOUND: 'Menu with id ${menuId} not exist!',
    ERROR_UPDATE_MENU_PARENT_NOT_FOUND:
      'Parent menu with id ${menuId} not exist!',
    ERROR_UPDATE_MENU: 'Error update menu',
    ERROR_BULK_UPDATE_MENU: 'Error bulk update menu',
    ERROR_DELETE_MENU: 'Error delete menu',
    ERROR_BUILD_MENU_HIERARCHY: 'Error mapping menu and features',
    ERROR_GET_ALL_MENU_CHILD_ID: 'Error get all child to delete menu',
    ERRROR_GET_ONE_ACCESS_MENU_BY_ID:
      'Error get access menu with ${accessMenuId}',
    ERROR_GETTING_MENU_HEADER: 'Error get menu header',
    ERROR_CIRCULAR_DEPENDENCY:
      'Circular dependency detected: Menu ${currentMenuId} cannot be a parent of itself indirectly',
  };
}
