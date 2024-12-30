import { BaseErrorMessages } from '../../../common/exceptions/base-error.message';

export class UtilsErrorMessage extends BaseErrorMessages {
  messages: {
    INVALID_PASSWORD_LENGTH: 'Password must be between 8 to 12 characters long.';
    INVALID_PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter.';
    INVALID_PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter.';
    INVALID_PASSWORD_NUMBER: 'Password must contain at least one number.';
    INVALID_PASSWORD_SPECIAL_CHARACTER: 'Password must contain at least one special character.';
    PASSWORD_NOT_MATCH: 'Password does not match';
    INVALID_PASSWORD_FORMAT: 'Invalid password format, must be encrypted';
  };
}
