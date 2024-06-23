import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequestDto } from './dto/userRequest.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { UserRole } from './model/user.model';
import { Public } from 'src/shared/decorator/public.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  getUser() {
    return this.userService.getAllUser();
  }

  // @Roles(UserRole.ADMIN)
  @Public()
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
    return this.userService.resetPassword(phone);
  }

  @Patch('/changePassword')
  changePassword(@Body() data) {
    const { newPassword, confirmPassword, phone } = data;

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

  @Post('security/:phone/:security')
  async addSecurity(
    @Param('phone') phone: string,
    @Param('security') security: string,
  ) {
    return await this.userService.addFavoriteSecurity(phone, security);
  }

  @Delete('security/:phone/:security')
  async removeSecurity(
    @Param('phone') phone: string,
    @Param('security') security: string,
  ) {
    return await this.userService.removeFavoriteSecurity(phone, security);
  }

  @Get('security/:phone')
  async getSecurity(
    @Param('phone') phone: string,
    @Query('symbol') symbol: string,
  ) {
    return await this.userService.getFavoriteSecurity(phone, symbol);
  }
}
