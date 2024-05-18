import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { StockModule } from './stock/stock.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/guard/roles.guard';
import { BuysellModule } from './buysell/buysell.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventsModule } from './events/events.module';
import { AuthenticatedGuard } from './shared/guard/authenticated.guard';
import { OhlcModule } from './ohlc/ohlc.module';

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
      models: [],
      autoLoadModels: true,
    }),
    UserModule,
    StockModule,
    AuthModule,
    BuysellModule,
    EventsModule,
    OhlcModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthenticatedGuard,
    // },
  ],
})
export class AppModule {}
