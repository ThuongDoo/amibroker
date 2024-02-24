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

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}
  @WebSocketServer() server: Server;
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello world!';
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

  async sendBuysellToAllClients(data: any) {
    this.server.emit('buysell', data);
  }
}
