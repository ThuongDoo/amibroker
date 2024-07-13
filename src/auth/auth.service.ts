import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

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
    const deviceInfo = req.sessionID;

    const user = await this.userService.findOne(userData.phone);
    if (user.isActive !== true) {
      return false;
    }
    const isExpire = await this.userService.checkExpiration(userData.phone);
    if (isExpire === true) {
      return false;
    }
    if (deviceInfo === user.deviceInfo) {
      return true;
    } else {
      return false;
    }
  }

  async sendEmail({ htmlContent, toEmail, subject }) {
    await this.mailerService
      .sendMail({
        to: toEmail,
        from: 'domanhthuong20122002@gmail.com',
        subject: subject,
        html: htmlContent,
      })
      .then((res) => {
        // console.log(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  async verifyEmail(email) {
    await this.userService.activeUser(email);
    return true;
  }
}
