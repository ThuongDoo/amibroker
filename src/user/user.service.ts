import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRequest } from './userRequest.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRequest) private userRequestModel: typeof UserRequest,
  ) {}

  async getUserRequest() {
    return this.userRequestModel.findAll();
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
}
