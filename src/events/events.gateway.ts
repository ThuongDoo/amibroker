import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {} from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';
import { StockService } from 'src/stock/stock.service';
import { Inject, Logger, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    // methods: ['GET', 'POST'],
    // transports: ['websocket', 'polling'],
    // credentials: true,
  },
  // allowEIO3: true,
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => StockService)) private stockService: StockService,
  ) {}

  private logger: Logger = new Logger('AppGateway');
  @WebSocketServer() server: Server;
  @SubscribeMessage('updateStockRequest')
  async handleUpdateStock(client: Socket, payload: any) {
    const data = await this.stockService.getStockByName(payload);
    this.logger.log(`Data send to client: ${data.length}`);

    const sanData = this.stockService.getSan();

    client.emit('updateStock', { data, sanData });
  }

  @SubscribeMessage('updateFilterRequest')
  async handleUpdateFilter(client: Socket, payload: any) {
    const data = await this.stockService.getFilter(payload);
    this.logger.log(`Update Filter to client: ${data.length}`);
    client.emit('updateFilter', { data });
  }

  afterInit(server: Server) {
    console.log(server);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnect: ${client.id}`);
  }
  handleConnection(client: Socket, ...args: any[]) {
    // delete
    this.logger.log(`Client connected: ${client.id}`);
    console.log(args);
  }

  // async sendStockToAllClients(data: any) {
  //   const realtimeData = this.stockService.getBuysellProfitRealtime();
  //   this.server.emit('stock', { data: data, realtimeData });
  // }
  async sendStockUpdateSignal() {
    this.logger.log(`Emit stock update signal`);

    this.server.emit('stockUpdated', true);
  }

  async sendBuysellToAllClients(data: any) {
    // const realtimeData = await this.stockService.getBuysellProfitRealtime();
    this.logger.log(`Emit buy sell to client`);

    this.server.emit('buysell', { data: data });
  }
}
