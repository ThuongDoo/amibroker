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
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private stockService: StockService) {}
  @WebSocketServer() server: Server;
  @SubscribeMessage('updateStockRequest')
  handleUpdateStock(client: Socket, payload: any) {
    console.log('Received updateStockRequest from client:', payload);

    this.server.emit('updateStock', 'hihi');
  }

  afterInit(server: Server) {
    console.log(server);
  }
  handleDisconnect(client: Socket) {
    console.log('Disconnect', client.id);
  }
  handleConnection(client: Socket, ...args: any[]) {
    console.log('Connected', client.id);
  }

  async sendStockToAllClients(data: any) {
    this.server.emit('stock', data);
  }
  async sendStockUpdateSignal() {
    this.server.emit('stockUpdated', true);
  }

  async sendBuysellToAllClients(data: any) {
    this.server.emit('buysell', data);
  }
}
