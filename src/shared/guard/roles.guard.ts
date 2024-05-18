import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { UserRole } from 'src/user/user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập đề truy cập tài nguyên này',
      );
    }

    const checkRoles = requiredRoles.some((role) => user.roles?.includes(role));
    if (!checkRoles) {
      throw new ForbiddenException('Nâng cấp gói để truy cập tài nguyên');
    }
    return checkRoles;
  }
}
