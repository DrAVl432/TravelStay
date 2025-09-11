import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Интерфейс для сообщений
interface Message {
  id: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  sentAt: string; // ISO формат
  readAt?: string; // ISO формат, необязателен
}

const SupportChatService = {
  async getMessages(chatId: string): Promise<Message[]> {
    // Исправил путь для получения сообщений
    const response = await axios.get(`${API_URL}/api/support-requests/${chatId}/messages`);
    return response.data;
  },

  async sendMessage(chatId: string, author: string, text: string): Promise<void> {
    // Исправил путь и параметры для отправки сообщений
    await axios.post(`${API_URL}/api/support-requests/${chatId}/send`, { author, text });
  },

  async getClientSupportRequests(): Promise<any[]> {
    // Исправил путь для получения запросов клиента
    const response = await axios.get(`${API_URL}/api/support-requests/`);
    return response.data;
  },

    async getManagerSupportRequests(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/api/support-requests/manager`);
    return response.data;
  },

  async createSupportRequest(userId: string, text: string): Promise<void> {
    // Скорректировал параметры для создания обращения
    await axios.post(`${API_URL}/api/support-requests/`, { userId, text });
  },

  async markMessagesAsRead(userId: string, supportRequestId: string, createdBefore: Date): Promise<void> {
    // Добавил метод для пометки прочитанных сообщений
    await axios.patch(`${API_URL}/api/support-requests/mark-read`, {
      user: userId,
      supportRequest: supportRequestId,
      createdBefore,
    });
  },

  async getUnreadCount(chatId: string): Promise<number> {
    // Исправил путь для получения количества непрочитанных сообщений
    const response = await axios.get(`${API_URL}/api/support-requests/${chatId}/unread-count`);
    return response.data.unreadCount;
  },

  async closeRequest(chatId: string): Promise<void> {
    // Исправил путь для закрытия обращения
    await axios.delete(`${API_URL}/api/support-requests/${chatId}/close`);
  },
};

export default SupportChatService;