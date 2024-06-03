import { Module } from '@nestjs/common';
import { SsiService } from './ssi.service';
import { SsiController } from './ssi.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Security } from './model/security.model';
import { IndexSecurity } from './model/indexSecurity.model';
import { Index } from './model/index.model';

@Module({
  imports: [SequelizeModule.forFeature([Security, IndexSecurity, Index])],
  providers: [SsiService],
  exports: [SsiService],
  controllers: [SsiController],
})
export class SsiModule {}
