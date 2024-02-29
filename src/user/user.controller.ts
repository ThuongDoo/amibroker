import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserRequestDto } from './dto/userRequest.dto';
import { LocalAuthGuard } from 'src/auth/guard/local.auth.guard';
import { AuthenticatedGuard } from 'src/auth/guard/authenticated.guard';
import { UserRole } from 'src/enum/role.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req): any {
    // console.log(req.session);

    // return { User: req.user, msg: 'user logged in' };
    return this.userService.login(req);
  }

  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'the user session has ended' };
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  getUser() {
    return this.userService.getAllUser();
  }

  @Post('/userRequest')
  createUserRequest(@Body() userRequestDto: UserRequestDto) {
    return this.userService.createUserRequest(userRequestDto);
  }

  @Get('/userRequest')
  getUserRequest() {
    return this.userService.getUserRequest();
  }

  @Delete('/userRequest/:ids')
  async deleteUserRequest(@Param('ids') userRequestIds: string) {
    return this.userService.deleteUserRequest(userRequestIds);
  }

  @Get('/createAdmin')
  createAdmin() {
    const user: CreateUserDto = {
      phone: '0333817395',
      email: 'domanhthuong20122002@gmail.com',
      name: 'admin Thuong',
      role: UserRole.ADMIN,
    };
    const createUser = this.userService.createUser(user);

    return { msg: 'success' };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/protected')
  getHello(@Request() req): string {
    return 'hohohoho';
    // return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/dashboard')
  getDashboard(@Request() req) {
    console.log('hah');
  }
}
