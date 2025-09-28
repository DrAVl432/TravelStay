import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import ChatWindow from './ChatWindow';
import SupportChatService from '../../API/support/SupportChatService';
import SocketService from './SocketService';

interface ChatModalProps {
  chatId: string;
  onClose: () => void;
  currentUserId: string;
  onSync?: () => void; // новый проп: обновление списков без закрытия
}

const ChatModal: React.FC<ChatModalProps> = ({ chatId, onClose, currentUserId, onSync }) => {
  const [text, setText] = useState<string>('');
  const [closing, setClosing] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    // при открытии узнаем статус, чтобы сразу корректно отрисовать
    SupportChatService.getSupportRequestDetails(chatId)
      .then((d) => setIsActive(d.isActive))
      .catch(() => {});
  }, [chatId]);

  const handleSend = async () => {
    if (!isActive) return; // запрет на фронте
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const newMessage = {
        _id: `${Date.now()}`,
        author: currentUserId,
        text: trimmed,
        sentAt: new Date().toISOString(),
      };

      await SupportChatService.sendMessage(chatId, currentUserId, trimmed);
      SocketService.sendMessage(chatId, newMessage);
      setText('');
    } catch (error: any) {
      alert(error?.message || 'Ошибка при отправке сообщения');
      console.error('[ChatModal] Ошибка при отправке сообщения:', error);
    }
  };

  const handleCloseRequest = async () => {
    try {
      setClosing(true);
      await SupportChatService.closeRequest(chatId);
      setIsActive(false);
      onClose(); // Родитель перезагрузит списки
    } catch (e) {
      console.error('[ChatModal] Ошибка при закрытии обращения:', e);
      alert('Не удалось закрыть обращение');
    } finally {
      setClosing(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="chat-modal"
      shouldCloseOnOverlayClick={false}
    >
      <div className="chat-modal-content">
        <ChatWindow
          id={chatId}
          currentUserId={currentUserId}
          onReadSync={onSync /* вместо onClose */}
          onStatusChange={setIsActive}
        />
        <div className="input-area">
          <input
            type="text"
            value={text}
            disabled={!isActive}
            onChange={(e) => setText(e.target.value)}
            placeholder={isActive ? 'Введите сообщение...' : 'Обращение закрыто'}
          />
          <button onClick={handleSend} disabled={!isActive || !text.trim()}>
            Отправить
          </button>
        </div>
        <div className="actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="close-btn" onClick={onClose}>
            Закрыть чат
          </button>
          <button
            className="close-request-btn"
            onClick={handleCloseRequest}
            disabled={closing || !isActive}
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