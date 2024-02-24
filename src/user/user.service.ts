import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRequest } from './userRequest.model';
import { User } from './user.model';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcryptjs';
import { UserRequestDto } from './dto/userRequest.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRequest) private userRequestModel: typeof UserRequest,
    @InjectModel(User) private userModel: typeof User,
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
      return {
        phone: user.phone,
        role: user.role,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      throw error;
    }
  }

  async createUserRequest(userRequestDto: UserRequestDto) {
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

  async getUserRequest() {
    return this.userRequestModel.findAll();
  }

  async getAllUser() {
    return this.userModel.findAll();
  }

  async getUser(phone: string) {
    const user = await this.userModel.findOne({ where: { phone: phone } });
    return user;
  }

  async deleteUserRequest(userRequestIds: string) {
    const ids = userRequestIds.split(',').map(Number);
    console.log(ids);

    try {
      const deleteCount = await this.userRequestModel.destroy({
        where: { id: ids },
      });
      return deleteCount;
    } catch (error) {
      throw error;
    }
  }

  async login(userData) {
    console.log('hah');
    const user = await this.userModel.findOne({
      where: { phone: userData.phone },
    });
    console.log(user.sessionId);
  }
}
