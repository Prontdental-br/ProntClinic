/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
cors: {
    origin: "*"
}
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    const accountId = socket.handshake.query.accountId as string;
    if (accountId) {
      socket.join(accountId);
      console.log(`Cliente conectado na sala: ${accountId}`);
    }
  }

  handleDisconnect(socket: Socket) {
    const accountId = socket.handshake.query.accountId as string;
    if (accountId) {
      console.log(`Cliente desconectado da sala: ${accountId}`);
    }
  }

  emitNewMessage(accountId: string, message: any) {
    this.server.to(accountId).emit('new-message', message);
  }
}
