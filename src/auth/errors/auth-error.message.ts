import { BaseErrorMessages } from '../../common/exceptions/base-error.message';

export class AuthErrorMessage extends BaseErrorMessages {
  messages = {
    ROLE_ID_NOT_FOUND: 'Role id is not found',
    USERNAME_NOT_FOUND: 'Username is not found',
    USER_NOT_FOUND: 'User is not found',
    FAILED_FIVE_TIMES: 'Failed to login due to 5 failed attempt !!',
    USER_NOT_ACTIVE: 'User is not active',
    CONFLICT_SESSION:
      'There is an active session for this user, please logout first !!',
    EXPIRED_REFRESH_TOKEN: 'Refresh token is expired',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    EXPIRED_LINK: 'Link has been expired, please register again',
    USER_AUTH_NOT_FOUND: 'User auth is not found',
    INVALID_EMAIL: 'This email is not registered as a user',
    USERNAME_ALREADY_USED:
      'Username already registered, please use another username',
    EMAIL_ALREADY_USED: 'Email already registered, please use another email',
    INVALID_PASSWORD_FORMAT: 'Invalid password format, must be encrypted',
    INVALID_PASSWORD: 'Invalid password',
    INVALID_LOGIN_NEED_APPROVAL_USERNAME:
      'Username cannot be used because the status is ${status}, please contact the administrator for further information',
    INVALID_LOGIN_NEED_APPROVAL_EMAIL:
      'Email cannot be used because the status is ${status}, please contact the administrator for further information',
  };
}
