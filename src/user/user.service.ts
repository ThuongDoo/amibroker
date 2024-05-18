import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserRequest } from "./userRequest.model";
import { User } from "./user.model";
import { CreateUserDto } from "./dto/createUser.dto";
import * as bcrypt from "bcryptjs";
import { UserRequestDto } from "./dto/userRequest.dto";
import { UserRole } from "src/enum/role.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRequest)
    private userRequestModel: typeof UserRequest,
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("123456", salt);
    console.log(createUserDto);

    let newDate;
    if (createUserDto.role !== UserRole.ADMIN) {
      const today = new Date();

      // Sao chép ngày hôm nay vào một đối tượng mới để tránh thay đổi trực tiếp
      const futureDate = new Date(today);

      // Cộng thêm 15 ngày vào ngày hiện tại
      futureDate.setDate(futureDate.getDate() + createUserDto.date);
      newDate = futureDate;
    } else {
      newDate = null;
    }
    try {
      const user = await this.userModel.create({
        phone: createUserDto.phone,
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        expirationDate: newDate,
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
    return this.userModel.findAll({
      attributes: { exclude: ["password"] },
    });
  }

  async getUser(phone: string) {
    const user = await this.userModel.findOne({
      where: { phone: phone },
      // attributes: { exclude: ['password'] },
    });
    return user;
  }

  async deleteUserRequest(userRequestIds: string) {
    const ids = userRequestIds.split(",").map(Number);
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

  async login(req) {
    const userData = req.user;
    const user = await this.userModel.findOne({
      where: { phone: userData.phone },
    });
    const deviceInfo = req.headers["user-agent"];
    console.log(deviceInfo);
    user.deviceInfo = deviceInfo;
    await user.save();
    // return { User: req.user, msg: 'user logged in' };

    // console.log(req.session);
  }
  async addDaysToExpiration(days: number, user) {
    if (user.expirationDate) {
      user.expirationDate.setDate(user.expirationDate.getDate() + days);
      await user.save();
    }
  }

  isExpired(user): boolean {
    console.log("expire date");

    console.log(user.expirationDate);
    if (user.expirationDate) {
      return user.expirationDate < new Date();
    }
    return false; // Không hết hạn nếu expirationDate là null
  }

  async checkDeviceInfo(req) {
    console.log(req.user);

    const user: User = await this.userModel.findOne({
      where: { phone: req.user.phone },
    });

    if (this.isExpired(user)) {
      console.log("expire");

      return false;
    } else {
      console.log("not expire");
    }
    const oldDeviceInfo = user.deviceInfo;
    const currentDeviceInfo = req.headers["user-agent"];
    console.log(oldDeviceInfo);
    console.log(currentDeviceInfo);

    if (oldDeviceInfo && oldDeviceInfo === currentDeviceInfo) {
      return true;
    } else {
      return false;
    }
  }

  async showMe(req) {
    const { phone } = req.user;
    return await this.userModel.findOne({
      where: { phone: phone },
      attributes: { exclude: ["password"] },
    });
  }

  async resetPassword(phone: string) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("123456", salt);
    const user = await this.userModel.findOne({ where: { phone: phone } });
    if (user) {
      user.password = password;
      await user.save();

      return { msg: "thay doi mat khau thanh cong" };
    }
    return { msg: "user khong ton tai" };
  }

  async changePassword(
    phone: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const user = await this.userModel.findOne({ where: { phone: phone } });
    if (!user) {
      throw new BadRequestException("no user");
    }

    const isPasswordCorrect = await bcrypt.compare(
      confirmPassword,
      user.password
    );
    console.log(isPasswordCorrect);

    if (isPasswordCorrect) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(newPassword, salt);
      user.password = password;
      await user.save();
      return { msg: "change password success" };
    }
    throw new BadRequestException("incorrect password");
  }

  async updateUser(createUserDto: CreateUserDto) {
    const user = await this.userModel.findOne({
      where: { phone: createUserDto.phone },
    });
    if (!user) {
      throw new BadRequestException("user not found");
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
        expirationDate: futureDate,
      });
    } catch (error) {
      throw new BadRequestException("update failed");
    }
  }

  async deleteUser(phone: string) {
    const deleteCount = await this.userModel.destroy({
      where: { phone: phone },
    });
    return deleteCount;
  }
}
