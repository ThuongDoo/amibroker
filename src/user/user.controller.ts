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
import { UserRequestDto } from './dto/userRequest.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { UserRole } from './user.model';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  getUser() {
    return this.userService.getAllUser();
  }

  @Roles(UserRole.ADMIN)
  @Post('/userRequest')
  createUserRequest(@Body() userRequestDto: UserRequestDto) {
    return this.userService.createUserRequest(userRequestDto);
  }

  @Roles(UserRole.ADMIN)
  @Get('/userRequest')
  getUserRequest() {
    return this.userService.getUserRequest();
  }

  @Roles(UserRole.ADMIN)
  @Delete('/userRequest/:ids')
  async deleteUserRequest(@Param('ids') userRequestIds: string) {
    return this.userService.deleteUserRequest(userRequestIds);
  }

  @Get('/showMe')
  showMe(@Request() req) {
    return this.userService.showMe(req);
  }

  @Roles(UserRole.ADMIN)
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

  @Roles(UserRole.ADMIN)
  @Patch('/updateUser')
  updateUser(@Body() data: UpdateUserDto) {
    return this.userService.updateUser(data);
  }

  @Roles(UserRole.ADMIN)
  @Delete('/deleteUser/:phone')
  deleteUser(@Param('phone') phones: string) {
    return this.userService.deleteUser(phones);
  }
}
