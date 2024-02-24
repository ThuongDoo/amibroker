import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const checkDeviceInfo = await this.userService.checkDeviceInfo(request);
    if (checkDeviceInfo) {
      return request.isAuthenticated();
    } else {
      return false;
    }

    // return request.isAuthenticated();
  }
}
