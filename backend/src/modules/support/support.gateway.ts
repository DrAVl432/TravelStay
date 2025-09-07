import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: true })
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private activeUsers: Map<string, Socket[]> = new Map();

  handleConnection(client: Socket) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    if (userId) {
      const sockets = this.activeUsers.get(userId) || [];
      this.activeUsers.set(userId as string, [...sockets, client]);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    if (userId && this.activeUsers.has(userId)) {
      const sockets = this.activeUsers.get(userId) || [];
      this.activeUsers.set(
        userId,
        sockets.filter((socket) => socket.id !== client.id),
      );
      if (this.activeUsers.get(userId)?.length === 0) {
        this.activeUsers.delete(userId);
      }
    }
  }

  @SubscribeMessage('message:subscribeToChat')
  handleSubscribeToChat(client: Socket, payload: { chatId: string }) {
    client.join(payload.chatId); // Присоединяем клиента к комнате чата
  }

  sendMessageToChat(chatId: string, message: any) {
    this.server.to(chatId).emit('message:new', message);
  }
}