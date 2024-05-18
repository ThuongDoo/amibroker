import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('hlhl');

    const isAuthenticated = request.isAuthenticated;
    if (isAuthenticated) {
      const isSameDevice = await this.authService.checkDeviceInfo(request);
      if (isSameDevice) {
        console.log('huhu');

        return true;
      } else {
        console.log('hahaa');
        throw new UnauthorizedException('Phiên đăng nhập đã kết thúc');
      }
    } else {
      console.log('hihi');

      // throw new UnauthorizedException(
      //   'Bạn cần đăng nhập để truy cập tài nguyên này',
      // );
      return false;
    }
  }
}
