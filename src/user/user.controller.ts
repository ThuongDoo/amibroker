import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
      date: null,
    };
    const createUser = this.userService.createUser(user);
    // delete
    console.log(createUser);

    return { msg: 'success' };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/protected')
  getHello(@Request() req): string {
    //delete
    console.log(req.user);

    return 'hohohoho';
    // return req.user;
  }

  // @Roles(UserRole.ADMIN)
  @UseGuards(AuthenticatedGuard)
  @Get('/admin')
  getAdmin(@Request() req): string {
    console.log('admin');

    //delete
    if (req.user?.role === UserRole.ADMIN) {
      return req.user;
    } else {
      console.log(req.user);

      // throw new BadRequestException();
    }
  }

  @Get('/showMe')
  showMe(@Request() req) {
    return this.userService.showMe(req);
  }

  @Patch('/resetPassword/:phone')
  resetPassword(@Param('phone') phone: string) {
    console.log(phone);

    return this.userService.resetPassword(phone);
  }

  @Patch('/changePassword')
  changePassword(@Body() data) {
    const { newPassword, confirmPassword, phone } = data;
    console.log(data);

    console.log(newPassword, confirmPassword, phone);

    return this.userService.changePassword(phone, newPassword, confirmPassword);
  }

  @Patch('/updateUser')
  updateUser(@Body() data: CreateUserDto) {
    return this.userService.updateUser(data);
  }

  @Delete('/deleteUser/:phone')
  deleteUser(@Param('phone') phone: string) {
    return this.userService.deleteUser(phone);
  }
}
