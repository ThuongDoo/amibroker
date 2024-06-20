import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StockModule } from './stock/stock.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BuysellModule } from './buysell/buysell.module';
import { EventsModule } from './events/events.module';
import { AuthenticatedGuard } from './shared/guard/authenticated.guard';
import { RolesGuard } from './shared/guard/roles.guard';
import { OhlcModule } from './ohlc/ohlc.module';
import { Buysell } from './buysell/buysell.model';
import { DailyOhlc } from './ohlc/model/dailyOhlc.model';
import { IntradayOhlc } from './ohlc/model/intradayOhlc.model';
import { User } from './user/model/user.model';
import { UserRequest } from './user/userRequest.model';
import { Roc } from './ohlc/model/roc.model';
import { SsiModule } from './ssi/ssi.module';
import { Index } from './ssi/model/index.model';
import { IndexSecurity } from './ssi/model/indexSecurity.model';
import { Security } from './ssi/model/security.model';
import { UserSecurity } from './user/model/userSecurity.model';
import { CategoryModule } from './category/category.module';
import { Category } from './category/model/category.model';
import { CategorySecurity } from './category/model/categorySecurity.model';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      cache: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      models: [
        Buysell,
        DailyOhlc,
        IntradayOhlc,
        User,
        UserRequest,
        UserSecurity,
        Roc,
        Index,
        IndexSecurity,
        Security,
        Category,
        CategorySecurity,
      ],
      autoLoadModels: true,
      synchronize: true,
      //TODO: DELETE
      logging: false,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    SsiModule,
    StockModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BuysellModule,
    EventsModule,
    OhlcModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    // { provide: APP_GUARD, useClass: AuthenticatedGuard },
    // { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
