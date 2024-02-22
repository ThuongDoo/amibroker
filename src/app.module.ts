import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global/global.module';
import { BoardModule } from './board/board.module';
import { EventGateway } from './event/event.gateway';

@Module({
  imports: [GlobalModule, BoardModule],
  controllers: [AppController],
  providers: [AppService, EventGateway],
})
export class AppModule {}
