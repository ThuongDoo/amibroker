import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const isAuthenticated = request.isAuthenticated();

    if (isAuthenticated) {
      const isSameDevice = await this.authService.checkDeviceInfo(request);
      if (isSameDevice) {
        return true;
      } else {
        throw new UnauthorizedException('Phiên đăng nhập đã kết thúc');
      }
    } else {
      throw new UnauthorizedException(
        'Bạn cần đăng nhập để truy cập tài nguyên này',
      );
      // return false;
    }
  }
}
