import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from './model/user.model';
import { UserRequest } from './userRequest.model';
import { UserRequestDto } from './dto/userRequest.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserSecurity } from './model/userSecurity.model';
import { Security } from 'src/ssi/model/security.model';
import { add } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserRequest)
    private userRequestModel: typeof UserRequest,
    @InjectModel(UserSecurity)
    private userSecurityModel: typeof UserSecurity,
    @InjectModel(Security)
    private securityModel: typeof Security,
  ) {}

  // USER

  findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(phone: string): Promise<User> {
    return this.userModel.findOne({ where: { phone } });
  }

  async addOne(createUserDto: CreateUserDto): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    const currentDate = new Date();

    // Cộng thêm 15 ngày
    const newDate = add(currentDate, { days: 15 });

    let password = '123456';
    if (createUserDto.password) {
      password = createUserDto.password;
    }

    const hashPassword = await bcrypt.hash(password, salt);
    try {
      const user = await this.userModel.create({
        phone: createUserDto.phone,
        name: createUserDto.name,
        password: hashPassword,
        email: createUserDto.email,
        roles: UserRole.STOCK1,
        expirationDate: newDate,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(createUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({
      where: { phone: createUserDto.phone },
    });
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }
    if (!user) {
      throw new BadRequestException('user not found');
    }
    try {
      const date = createUserDto.date;

      const today = new Date();
      const userDate = user.expirationDate;
      let futureDate;
      // Sao chép ngày hôm nay vào một đối tượng mới để tránh thay đổi trực tiếp
      if (userDate >= today) {
        switch (date) {
          case '15d':
            futureDate = add(userDate, { days: 15 });
            break;
          case '3m':
            futureDate = add(userDate, { months: 3 });
            break;
          case '6m':
            futureDate = add(userDate, { months: 6 });
            break;
          case '1y':
            futureDate = add(userDate, { years: 1 });
            break;
          default:
            break;
        }
      } else {
        switch (date) {
          case '15d':
            futureDate = add(today, { days: 15 });
            break;
          case '3m':
            futureDate = add(today, { months: 3 });
            break;
          case '6m':
            futureDate = add(today, { months: 6 });
            break;
          case '1y':
            futureDate = add(today, { years: 1 });
            break;
          default:
            break;
        }
      }

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

  async saveDeviceInfo(req: Request) {
    const userData: any = req.user;
    const deviceInfo = req.headers['user-agent'];

    const user = await this.userModel.findOne({
      where: { phone: userData.phone },
    });
    user.deviceInfo = deviceInfo;
    await user.save();
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

  // USER REQUEST

  async getUserRequest() {
    return this.userRequestModel.findAll();
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

  async deleteUserRequest(userRequestIds: string) {
    const ids = userRequestIds.split(',').map(Number);

    try {
      const deleteCount = await this.userRequestModel.destroy({
        where: { id: ids },
      });
      return deleteCount;
    } catch (error) {
      throw error;
    }
  }

  // SECURITY

  async addFavoriteSecurity(phone: string, securitySymbol: string) {
    const user = await this.userModel.findOne({ where: { phone: phone } });
    if (!user) {
      throw new BadRequestException('user is not exist');
    }

    const security = await this.securityModel.findOne({
      where: { Symbol: securitySymbol },
      attributes: ['Symbol'],
    });
    if (!security) {
      throw new BadRequestException('security is not exist');
    }

    const userSecurity = await this.userSecurityModel.create(
      {
        phone: phone,
        symbol: securitySymbol,
      },
      { ignoreDuplicates: true },
    );

    return { userSecurity };
  }

  async removeFavoriteSecurity(phone: string, securitySymbol: string) {
    const result = await this.userSecurityModel.findOne({
      where: { phone: phone, symbol: securitySymbol },
    });
    if (!result) {
      throw new BadRequestException('not found');
    }
    await result.destroy();

    return { message: 'delete success' };
  }

  async getFavoriteSecurity(phone: string, symbol: string) {
    if (symbol) {
      const result = await this.userSecurityModel.findOne({
        where: { phone: phone, symbol: symbol },
      });
      return { data: result };
    }
    const user = await this.userModel.findOne({
      where: { phone: phone },
      include: [
        {
          model: this.securityModel, // Assuming 'securitiesModel' exists
          as: 'Securities', // Optional alias for clarity (optional)
          attributes: ['Symbol'], // Include only the 'Symbol' attribute
        },
      ],
    });

    if (!user) {
      throw new BadRequestException('user is not exist');
    }

    return { data: user.Securities };
  }
}
