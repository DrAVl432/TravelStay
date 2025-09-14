import React, { useEffect, useState } from 'react';
import SupportChatService from '../../API/support/SupportChatService';
import { UserListApi } from '../../API/User/UserList.api'; // Импорт API пользователей
import { User } from '../../../../backend/src/modules/user/schemas/user.schema'; // Импорт из backend-схемы

interface Message {
  _id: string;
  text: string;
  sentAt: string;
  readAt?: string;
  author: string;
}

interface ChatWindowProps {
  id: string;
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ id, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requestText, setRequestText] = useState<string>('');

  useEffect(() => {
    console.log("Current User ID:", currentUserId);

    // Загрузка сообщений
    SupportChatService.getMessages(id)
      .then((msgs) => {
        setMessages(msgs);
      })
      .catch(console.error);

    // Загрузка текста обращения
    SupportChatService.getSupportRequestDetails(id)
      .then((data) => {
        setRequestText(data.text);
      })
      .catch(console.error);

    // Загрузка списка пользователей
    UserListApi.fetchUsersInfo()
      .then((userList) => {
        setUsers(userList);
        console.log("Loaded Users:", userList);
      })
      .catch(console.error);
  }, [id, currentUserId]);

  // Функция поиска имени автора по _id
  const getAuthorName = (author: string) => {
    const user = users.find((u) => String(u._id) === author);
    return user ? user.name : 'Неизвестный автор';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowDate = (currentMessageDate: string, previousMessageDate?: string) => {
    if (!previousMessageDate) return true;
    return new Date(currentMessageDate).toDateString() !== new Date(previousMessageDate).toDateString();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Обращение: {requestText}</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDate = shouldShowDate(msg.sentAt, prevMsg?.sentAt);

          return (
            <div key={msg._id}>
              {showDate && <div className="date-header">{formatDate(msg.sentAt)}</div>}
              <div
                className={`message-container ${
                  String(msg.author) === String(currentUserId) ? 'current-user' : 'other-user'
                }`}
              >
                {String(msg.author) !== String(currentUserId) && (
                  <div className="message-author">{getAuthorName(msg.author)}</div> // Отображение имени вместо ID
                )}
                <div className="message">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{formatTime(msg.sentAt)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindow;