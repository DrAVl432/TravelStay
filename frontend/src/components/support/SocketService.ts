import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_API_URL || '', {
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  subscribeToChat(chatId: string, callback: (message: any) => void) {
    if (!this.socket) return;

    this.socket.emit('message:subscribeToChat', { chatId });
    this.socket.on('message:new', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();