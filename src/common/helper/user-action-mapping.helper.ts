import { UserAction } from 'src/user-activities/constants/user-action';

export const GetUserActionMapping = (method: string, endpoint: string): string => {
  let action = "unknow";
  method = !method ? "" : method.toLowerCase();
  endpoint = !endpoint ? "" : endpoint.toLowerCase();

  switch (true) {
    case endpoint.includes('login'):
      action = UserAction.LOGIN;
      break;
    case endpoint.includes('register'):
      action = UserAction.REGISTER;
      break;
    case endpoint.includes('logout'):
      action = UserAction.LOGOUT;
      break;
    case method.includes('get'):
        action = UserAction.GET;
        break;
    case method.includes('post'):
      action = UserAction.CREATE;
      break;
    case method.includes('put') || method.includes('patch'):
      action = UserAction.UPDATE;
      break;
    case method.includes('delete'):
      action = UserAction.DELETE;
      break;
  }

  return action
};
