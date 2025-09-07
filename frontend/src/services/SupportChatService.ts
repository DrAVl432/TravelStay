import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const SupportChatService = {
  async getMessages(chatId) {
    const response = await axios.get(`${API_URL}/api/common/support-requests/${chatId}/messages`);
    return response.data;
  },
  async sendMessage(chatId, text) {
    await axios.post(`${API_URL}/api/common/support-requests/${chatId}/messages`, { text });
  },
};

export default SupportChatService;