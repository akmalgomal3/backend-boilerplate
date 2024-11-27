import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../entity/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RoleEnum[]>('roles',context.getHandler());
    if (!requiredRoles) {
      return true; 
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      return false; 
    }

    
    
    return requiredRoles.some((role) => user?.role === role);
  }
}
