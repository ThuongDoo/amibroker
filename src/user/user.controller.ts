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
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

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
  deleteUser(@Param('phone') phones: string) {
    return this.userService.deleteUser(phones);
  }
}
