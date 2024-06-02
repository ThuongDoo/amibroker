import { Module } from '@nestjs/common';
import { SsiService } from './ssi.service';
import { SsiController } from './ssi.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Security } from './security.model';

@Module({
  imports: [SequelizeModule.forFeature([Security])],
  providers: [SsiService],
  exports: [SsiService],
  controllers: [SsiController],
})
export class SsiModule {}
