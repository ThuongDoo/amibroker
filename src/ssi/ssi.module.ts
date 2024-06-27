import { Module, forwardRef } from '@nestjs/common';
import { SsiService } from './ssi.service';
import { SsiController } from './ssi.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Security } from './model/security.model';
import { IndexSecurity } from './model/indexSecurity.model';
import { Index } from './model/index.model';
import { OhlcModule } from 'src/ohlc/ohlc.module';
import { OrderBook } from './model/orderBook.model';
import { NuocNgoai } from './model/nuocNgoai.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Security,
      IndexSecurity,
      Index,
      OrderBook,
      NuocNgoai,
    ]),
    forwardRef(() => OhlcModule),
  ],
  providers: [SsiService],
  exports: [SsiService],
  controllers: [SsiController],
})
export class SsiModule {}
