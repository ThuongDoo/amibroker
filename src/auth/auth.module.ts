import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import { UserRequest } from 'src/user/userRequest.model';

@Module({
  imports: [SequelizeModule.forFeature([User, UserRequest])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
