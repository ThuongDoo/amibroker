import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequestDto } from './dto/UserRequestDto';
import { CreateUserDto } from './dto/createUserDto';
import { UserRole } from './user.model';
import { UpdateUserDto } from './dto/updateUserDto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
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
      roles: UserRole.ADMIN,
      date: null,
    };
    const createUser = this.userService.addOne(user);
    // delete
    console.log(createUser);

    return { msg: 'success' };
  }

  // @Roles(UserRole.ADMIN)
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
  updateUser(@Body() data: UpdateUserDto) {
    return this.userService.updateUser(data);
  }

  @Delete('/deleteUser/:phone')
  deleteUser(@Param('phone') phone: string) {
    return this.userService.deleteUser(phone);
  }
}
