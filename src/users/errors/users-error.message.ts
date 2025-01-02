import { BaseErrorMessages } from '../../common/exceptions/base-error.message';

export class UsersErrorMessage extends BaseErrorMessages {
  messages: {
    USER_NOT_FOUND: 'User is not found',
    USER_AUTH_NOT_FOUND: 'User auth is not found',
    INVALID_USER_AUTH_MUST_BE_REQUESTED: 'User auth status is not requested',
    ROLE_ID_NOT_FOUND: 'Role id is not found',
    INVALID_OLD_PASSWORD: 'Old password is invalid',
    EMAIL_ALREADY_USED: 'Email already registered, please use another email',
    INVALID_TOKEN: 'Invalid token',
    EXPIRED_LINK: 'Link has been expired, please register again',
    PASSWORD_NOT_MATCH: 'Password does not match',
    SAME_OLD_PASSWORD: 'New password must be different from old password',
    USERNAME_ALREADY_USED: 'Username already registered, please use another username',
  };
}
