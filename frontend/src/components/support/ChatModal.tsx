import React, { useState } from 'react';
import Modal from 'react-modal';
import ChatWindow from './ChatWindow';
import SupportChatService from '../../API/support/SupportChatService';
import SocketService from './SocketService';

interface ChatModalProps {
  chatId: string;
  onClose: () => void;
  currentUserId: string;
}

Modal.setAppElement('#root');

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose, currentUserId }) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (text.trim()) {
      const newMessage = {
        chatId,
        author: currentUserId,
        text,
        sentAt: new Date().toISOString(),
      };

      try {
        // Сохранение на сервере
        await SupportChatService.sendMessage(chatId, currentUserId, text);

        // Отправка через WebSocket
        SocketService.sendMessage(chatId, newMessage);

        setText('');
      } catch (error) {
        console.error('[ChatModal] Ошибка при отправке сообщения:', error);
      }
    } else {
      console.warn('[ChatModal] Попытка отправить пустое сообщение');
    }
  };

  return (
    <Modal isOpen={true} onRequestClose={onClose} className="chat-modal">
      <div className="chat-modal-content">
        <ChatWindow id={chatId} currentUserId={currentUserId} />
        <div className="input-area">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите сообщение..."
          />
          <button onClick={handleSend}>Отправить</button>
        </div>
        <button className="close-btn" onClick={onClose}>
          Закрыть чат
        </button>
      </div>
    </Modal>
  );
};

export default ChatModal;