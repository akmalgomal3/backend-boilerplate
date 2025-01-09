import { BaseErrorMessages } from '../../common/exceptions/base-error.message';

export class FeaturesErrorMessage extends BaseErrorMessages {
  messages = {
    ERROR_GET_FEATURES: 'Error get all features',
    ERROR_GET_FEATURE_BY_ID_NOT_FOUND: 'Feature with ID ${featureId} not found',
    ERROR_GET_FEATURES_BY_ID: 'Error get feature by id',
    ERROR_GET_FEATURE_BY_NAME_NOT_FOUND:
      'Feature with name ${featureName} not found',
    ERROR_GET_FEATURES_BY_NAME: 'Error get feature by name',
    ERROR_CREATE_FEATURE_ALREADY_AVAILABLE:
      'Feature with name ${featureName} already available!',
    ERROR_CREATE_FEATURE_MENU_NOT_EXIST: 'Menu with id ${menuId} not exist!',
    ERROR_CREATE_FEATURE: 'Error create new feature',
    ERROR_UPDATE_FEATURE_NOT_FOUND: 'Feature with id ${featureId} not exist!',
    ERROR_UPDATE_FEATURE_ALREADY_AVAILABLE:
      'Feature with name ${featureName} already available!',
    ERROR_UPDATE_FEATURE_MENU_NOT_EXIST: 'Menu with id ${menuId} not exist!',
    ERROR_UPDATE_FEATURE: 'Error update feature',
    ERROR_DELETE_FEATURE: 'Error delete feature',
    ERROR_BULK_UPDATE_FEATURE: 'Error bulk update feature',
    ERROR_BULK_DELETE_FEATURE: 'Error bulk delete feature',
  };
}
