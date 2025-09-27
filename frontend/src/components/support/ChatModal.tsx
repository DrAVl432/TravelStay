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

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose, currentUserId }) => {
  const [text, setText] = useState<string>('');
  const [closing, setClosing] = useState<boolean>(false);

  const handleSend = async () => {
    if (text.trim()) {
      try {
        const newMessage = {
          _id: `${Date.now()}`,
          author: currentUserId,
          text: text.trim(),
          sentAt: new Date().toISOString(),
        };

        // Сохранение на сервере
        await SupportChatService.sendMessage(chatId, currentUserId, text.trim());

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

  const handleCloseRequest = async () => {
    try {
      setClosing(true);
      await SupportChatService.closeRequest(chatId);
      onClose(); // Родитель перезагрузит списки
    } catch (e) {
      console.error('[ChatModal] Ошибка при закрытии обращения:', e);
      alert('Не удалось закрыть обращение');
    } finally {
      setClosing(false);
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
        <div className="actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="close-btn" onClick={onClose}>
            Закрыть чат
          </button>
          <button
            className="close-request-btn"
            onClick={handleCloseRequest}
            disabled={closing}
            title="Перевести обращение в статус «Закрыто»"
          >
            {closing ? 'Закрываем...' : 'Закрыть обращение'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;