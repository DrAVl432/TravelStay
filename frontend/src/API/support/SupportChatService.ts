const API_URL = process.env.REACT_APP_API_URL;

// Интерфейс для сообщений
interface Message {
  _id: string;
  author: string;
  // {
  //   id: string;
  //   name: string;
  // };
  text: string;
  sentAt: string; // ISO формат
  readAt?: string; // ISO формат, необязателен
}

const SupportChatService = {
  async getMessages(chatId: string): Promise<Message[]> {
    const response = await fetch(`${API_URL}/api/support-requests/${chatId}/messages`);
    if (!response.ok) {
      throw new Error(`Ошибка при получении сообщений: ${response.statusText}`);
    }
    return await response.json();
  },

  async sendMessage(chatId: string, author: string, text: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/support-requests/${chatId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author, text }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке сообщения: ${response.statusText}`);
    }
  },

  async getClientSupportRequests(userId: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/support-requests/client-requests?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`Ошибка при получении запросов клиента: ${response.statusText}`);
    }

    return await response.json();
  },

  async getManagerSupportRequests(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/support-requests/manager-requests`);

    if (!response.ok) {
      throw new Error(`Ошибка при получении запросов менеджера: ${response.statusText}`);
    }

    return await response.json();
  },

  async createSupportRequest(userId: string, text: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/support-requests/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ userId, text }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка при создании обращения: ${response.statusText}`);
    }
  },

  async markMessagesAsRead(userId: string, supportRequestId: string, createdBefore: Date): Promise<void> {
    const response = await fetch(`${API_URL}/api/support-requests/mark-read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userId, supportRequest: supportRequestId, createdBefore }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка при пометке сообщений как прочитанных: ${response.statusText}`);
    }
  },

  async getUnreadCount(chatId: string): Promise<number> {
    const response = await fetch(`${API_URL}/api/support-requests/${chatId}/unread-count`);

    if (!response.ok) {
      throw new Error(`Ошибка при получении количества непрочитанных сообщений: ${response.statusText}`);
    }

    const data = await response.json();
    return data.unreadCount;
  },

  async closeRequest(chatId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/support-requests/${chatId}/close`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Ошибка при закрытии обращения: ${response.statusText}`);
    }
  },

  async getSupportRequestDetails(chatId: string): Promise<{ text: string }> {
  const response = await fetch(`${API_URL}/api/support-requests/${chatId}`);
  if (!response.ok) {
    throw new Error(`Ошибка при получении деталей обращения: ${response.statusText}`);
  }
  return await response.json();
},
};

export default SupportChatService;