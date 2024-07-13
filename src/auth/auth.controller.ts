import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../shared/guard/local-auth.guard';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import { Public } from 'src/shared/decorator/public.decorator';
import * as CryptoJS from 'crypto-js';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  secretKey = 'mysecretkey';

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req): any {
    this.userService.saveDeviceInfo(req);
    return { User: req.user, msg: 'Đăng nhập thành công' };
  }

  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'Phiên đăng nhập đã kết thúc' };
  }

  @Public()
  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const token = CryptoJS.AES.encrypt(
      createUserDto.email,
      this.secretKey,
    ).toString();
    // const htmlContent = `<p>Dear user,</p>
    //         <p>Please click the following link to verify your email address:</p>
    //         <a href="http://localhost:3001/verifying?token=${token}">Verify Email</a>
    //         <p>Thank you!</p>`;

    const htmlContent = `<p>Dear user,</p>
            <p>Please click the following link to verify your email address:</p>
            <a href="https://chungkhoanxyz.com/verifying?token=${token}">Verify Email</a>
            <p>Thank you!</p>`;
    const subject = 'Verify your email address';

    await this.userService.addOne(createUserDto);
    this.authService.sendEmail({
      htmlContent,
      toEmail: createUserDto.email,
      subject,
    });
  }

  @Get('/verify-change-password')
  async verifyChangePassword(@Query('email') email: string) {
    const token = CryptoJS.AES.encrypt(email, this.secretKey).toString();
    // const htmlContent = `<p>Dear user,</p>
    //         <p>Please click the following link to change your password:</p>
    //         <a href="http://localhost:3001/change-password-verifying?token=${token}">Change password</a>
    //         <p>Thank you!</p>`;
    const htmlContent = `<p>Dear user,</p>
            <p>Please click the following link to change your password:</p>
            <a href="https://chungkhoanxyz.com/change-password-verifying?token=${token}">Change password</a>
            <p>Thank you!</p>`;
    const subject = 'Change password';

    await this.authService.sendEmail({
      htmlContent,
      toEmail: email,
      subject,
    });

    return true;
  }

  @Public()
  @Post('/verify-email')
  async verifyEmail(@Body() data: any) {
    const email = await CryptoJS.AES.decrypt(
      data.token,
      this.secretKey,
    ).toString(CryptoJS.enc.Utf8);
    const a = await this.authService.verifyEmail(email);
    return a;
  }
}
