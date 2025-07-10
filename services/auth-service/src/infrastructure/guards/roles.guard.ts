import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );
    if (!roles || roles.length === 0) {
      return true;
    }
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (user && roles.includes(user.role)) {
        return true;
      }
    } else if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      const user = data.user;
      if (user && roles.includes(user.role)) {
        return true;
      }
    }
    throw new ForbiddenException('Access denied');
  }
}

