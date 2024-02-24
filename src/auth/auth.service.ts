import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/createUser.dto';
import { UserRequest } from 'src/user/userRequest.model';
import { UserRequestDto } from './dto/userRequest.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(UserRequest) private userRequestModel: typeof UserRequest,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);
    try {
      const user = await this.userModel.create({
        phone: createUserDto.phone,
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        password: password,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signup(userRequestDto: UserRequestDto) {
    try {
      const userRequest = await this.userRequestModel.create({
        phone: userRequestDto.phone,
        email: userRequestDto.email,
        name: userRequestDto.name,
        content: userRequestDto.content,
      });
      return userRequest;
    } catch (error) {
      throw error;
    }
  }
}
