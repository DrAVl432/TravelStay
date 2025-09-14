import React, { useState } from 'react';
import Modal from 'react-modal';
import ChatWindow from './ChatWindow';
import SupportChatService from '../../API/support/SupportChatService';

interface ChatModalProps {
  chatId: string;
  onClose: () => void;
  currentUserId: string; // ID текущего пользователя
}

Modal.setAppElement('#root'); // Установка корневого элемента для модального окна

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose, currentUserId }) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (text.trim()) {
      try {
        await SupportChatService.sendMessage(chatId, currentUserId, text);
        setText('');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  };

  return (
    <Modal isOpen={true} onRequestClose={onClose} className="chat-modal">
      <div className="chat-modal-content">
        {/* Чат */}
        <ChatWindow id={chatId} currentUserId={currentUserId} />

        {/* Отправка нового сообщения */}
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