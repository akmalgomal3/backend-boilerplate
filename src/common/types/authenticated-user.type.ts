import { Request } from 'express';
import { JwtPayload } from './jwt-payload.type';

export interface IAuthenticatedUser extends Request {
  user: JwtPayload;
}
