import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

   // Подключение к сокету с передачей userId
  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_API_URL || '', {
      query: { userId },
    });
    console.log('WebSocket подключен');
  }

  // Подписка на чат (для добавления новых сообщений)
  subscribeToChat(chatId: string, callback: (message: any) => void) {
    if (!this.socket) return;

    this.socket.emit('message:subscribeToChat', { chatId });
    this.socket.on('message:new', callback);
  }

   // Отписка от конкретного события (чистый обработчик)
  unsubscribeFromChat(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off('message:new', callback);
    }
  }

  // Отправка нового сообщения в сокет (оповещение других участников)
  sendMessage(chatId: string, message: any) {
    if (!this.socket) return;

    this.socket.emit('message:new', { chatId, ...message });
  }

  // Отключение сокета
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket отключен');
    }
  }
}

export default new SocketService();