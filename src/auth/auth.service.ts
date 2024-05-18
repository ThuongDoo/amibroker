import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userService.findOne(phone);

    if (!user) {
      throw new NotFoundException('User is not exist');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }

    if (user && passwordValid) {
      return {
        phone: user.phone,
        name: user.name,
        email: user.email,
        roles: user.roles,
      };
    }
    return null;
  }

  async checkDeviceInfo(req: Request) {
    const userData: any = req.user;
    const deviceInfo = req.headers['user-agent'];

    const user = await this.userService.findOne(userData.phone);
    if (deviceInfo === user.deviceInfo) {
      return true;
    } else {
      return false;
    }
  }
}
