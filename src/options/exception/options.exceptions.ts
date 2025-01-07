import { BaseErrorMessages } from '../../common/exceptions/base-error.message';

export class OptionsErrorMessage extends BaseErrorMessages {
  messages = {
    ERROR_GET_ENUM_NOT_FOUND:
      'Enum input not found! Choose one ${availableEnums}',
  };
}
