import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user: JwtPayload = request.user;

    const csrfToken: string = request.headers['x-csrf-token'];

    if (!csrfToken) {
      throw new UnauthorizedException('CSRF token is missing');
    }

    const isValid = this.userService.validateCsrfToken(user.id, csrfToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }
}
