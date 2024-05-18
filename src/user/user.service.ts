import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserRequest } from './userRequest.model';
import { UserRequestDto } from './dto/userRequest.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserRequest)
    private userRequestModel: typeof UserRequest,
  ) {}

  findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(phone: string): Promise<User> {
    return this.userModel.findOne({ where: { phone } });
  }

  async addOne(createUserDto: CreateUserDto): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    const password = '123456';
    const hashPassword = await bcrypt.hash(password, salt);
    try {
      console.log('haha', createUserDto);

      const user = await this.userModel.create({
        phone: createUserDto.phone,
        name: createUserDto.name,
        password: hashPassword,
        email: createUserDto.email,
        roles: createUserDto.roles,
      });
      console.log(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async saveDeviceInfo(req: Request) {
    const userData: any = req.user;
    const deviceInfo = req.headers['user-agent'];

    const user = await this.userModel.findOne({
      where: { phone: userData.phone },
    });
    user.deviceInfo = deviceInfo;
    await user.save();
  }

  async getUserRequest() {
    return this.userRequestModel.findAll();
  }

  async getAllUser() {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] },
    });
  }

  async changePassword(
    phone: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await this.userModel.findOne({ where: { phone: phone } });
    if (!user) {
      throw new BadRequestException('no user');
    }

    const isPasswordCorrect = await bcrypt.compare(
      confirmPassword,
      user.password,
    );
    console.log(isPasswordCorrect);

    if (isPasswordCorrect) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(newPassword, salt);
      user.password = password;
      await user.save();
      return { msg: 'change password success' };
    }
    throw new BadRequestException('incorrect password');
  }

  async resetPassword(phone: string) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);
    const user = await this.userModel.findOne({ where: { phone: phone } });
    if (user) {
      user.password = password;
      await user.save();

      return { msg: 'thay doi mat khau thanh cong' };
    }
    return { msg: 'user khong ton tai' };
  }

  async showMe(req) {
    const { phone } = req.user;
    return await this.userModel.findOne({
      where: { phone: phone },
      attributes: { exclude: ['password'] },
    });
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

  async deleteUser(phones: string) {
    const ids = phones.split(',').map(Number);

    try {
      const deleteCount = await this.userModel.destroy({
        where: { phone: ids },
      });
      return deleteCount;
    } catch (error) {
      throw error;
    }
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

  async updateUser(createUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({
      where: { phone: createUserDto.phone },
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    try {
      const today = new Date();
      const userDate = user.expirationDate;
      const futureDate = new Date();
      // Sao chép ngày hôm nay vào một đối tượng mới để tránh thay đổi trực tiếp
      if (userDate >= today) {
        futureDate.setDate(userDate.getDate() + createUserDto.date);
      } else {
        futureDate.setDate(today.getDate() + createUserDto.date);
      }

      console.log(futureDate);

      await user.update({
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        password: createUserDto.password,
        expirationDate: futureDate,
      });
    } catch (error) {
      throw new BadRequestException('update failed');
    }
  }
}
