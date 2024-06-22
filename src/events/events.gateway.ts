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
import { BuysellService } from 'src/buysell/buysell.service';
import { SsiService } from 'src/ssi/ssi.service';

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
    @Inject(forwardRef(() => StockService))
    private readonly stockService: StockService,

    @Inject(forwardRef(() => BuysellService))
    private readonly buysellService: BuysellService,
    private readonly ssiService: SsiService,
  ) {}

  private logger: Logger = new Logger('AppGateway');
  @WebSocketServer() server: Server;

  @SubscribeMessage('filterd_stock_request')
  async handleUpdateFilter(client: Socket, payload: any) {
    const data = await this.stockService.getFilter(payload);
    this.logger.log(`filter_stock_request ${client.id}`);

    client.emit('update_filtered_stock_data', { data });
  }

  @SubscribeMessage('stock_request')
  async handleUpdateStock(client: Socket, payload: any) {
    this.logger.log(`stock_request ${client.id}`);

    const data = await this.stockService.getStockByName(payload);

    client.emit('stock_update', { data });
  }

  @SubscribeMessage('ssi_mi_request')
  async handleUpdateMi(client: Socket, payload: any) {
    this.logger.log(`ssi_mi_request ${client.id}`);

    const data = this.ssiService.getMiData(payload);
    client.emit('ssi_mi_update', { data: data });
  }

  @SubscribeMessage('ssi_trade_request')
  async handleUpdateTrade(client: Socket, payload: any) {
    this.logger.log(`ssi_trade_request ${client.id}`);

    const data = await this.ssiService.getTradeData(payload);
    client.emit('ssi_trade_update', { data: data });
  }

  @SubscribeMessage('ssi_favorite_request')
  async handleUpdateFavorite(client: Socket, payload: any) {
    this.logger.log(`ssi_favorite_request ${client.id}`);

    const data = await this.ssiService.getTradeData(payload);
    client.emit('ssi_favorite_update', { data: data });
  }

  @SubscribeMessage('ssi_x_request')
  async handleUpdateX(client: Socket, payload: any) {
    this.logger.log(`ssi_x_request ${client.id}`);

    const data = await this.ssiService.getXData(payload);
    client.emit('ssi_x_update', { data: data });
  }

  @SubscribeMessage('ssi_r_request')
  async handleUpdateR(client: Socket, payload: any) {
    this.logger.log(`ssi_r_request ${client.id}`);

    const data = await this.ssiService.getRData(payload);
    client.emit('ssi_r_update', { data: data });
  }

  @SubscribeMessage('ssi_order_book_request')
  async handleUpdateOrderBook(client: Socket, payload: any) {
    this.logger.log(`ssi_order_book_request ${client.id}`);

    const data = await this.ssiService.getOrderBook(payload);

    client.emit('ssi_order_book_update', { data: data });
  }

  @SubscribeMessage('ssi_b_request')
  async handleUpdateB(client: Socket, payload: any) {
    this.logger.log(`ssi_b_request ${client.id}`);

    const data = await this.ssiService.getBData(payload);

    client.emit('ssi_b_update', { data: data });
  }

  afterInit(server: Server) {
    // console.log(server);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnect: ${client.id}`);
  }
  handleConnection(client: Socket, ...args: any[]) {
    // delete
    this.logger.log(`Client connected: ${client.id}`);
  }

  async sendStockUpdateSignal() {
    this.logger.log(`Emit stock update signal`);
    this.server.emit('new_stock_data_available', true);
  }

  async sendBuysellToClient(data: any) {
    // const realtimeData = await this.stockService.getBuysellProfitRealtime();
    this.logger.log(`Emit buy sell to client`);

    this.server.emit('update_buysell_data', { data: data });
  }
}
