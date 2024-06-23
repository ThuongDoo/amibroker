import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../shared/guard/local-auth.guard';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import { Public } from 'src/shared/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

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
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.addOne(createUserDto);
  }
}
