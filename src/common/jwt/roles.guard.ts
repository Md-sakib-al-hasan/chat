import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role !== requiredRole) {
      throw new ForbiddenException('Access denied: You do not have permission to access this resource.');
    }

    return true;
  }
}
