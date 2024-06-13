import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { AuthModule } from 'src/auth/auth.module';
import { UserRequest } from './userRequest.model';
import { UserSecurity } from './model/userSecurity.model';
import { Security } from 'src/ssi/model/security.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserRequest, UserSecurity, Security]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
