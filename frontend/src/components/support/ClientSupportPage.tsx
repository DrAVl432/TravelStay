import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SupportChatService from '../../API/support/SupportChatService';
import { useAuth } from '../../context/AuthContext';
import  ChatModal  from '../support/ChatModal';
// import { User } from '../../../../backend/src/modules/user/schemas/user.schema';

interface SupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
  unreadCount: number;

  
}


interface User {
  id: string;
  name: string; // Добавлено это поле
  // Другие поля...
}

const ClientSupportPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedChat, setSelectedChat] = useState<null | string>(null);

  useEffect(() => {
    if (user?.id) {
      SupportChatService.getClientSupportRequests(user.id).then(setRequests).catch(console.error);
    }
  }, [user]);

  const handleUnreadClick = (requestId: string) => {
    setSelectedChat(requestId); // Открытие модального окна с чатом
  };

  const closeChat = () => {
    setSelectedChat(null); // Закрытие модального окна
  };

  return (
    <div>
      <h2>Мои обращения</h2>
      <button onClick={async () => {
        const newRequest = prompt('Введите текст обращения:');
        if (newRequest && user?.id) {
          await SupportChatService.createSupportRequest(user.id, newRequest);
          const updatedRequests = await SupportChatService.getClientSupportRequests(user.id);
          setRequests(updatedRequests);
        }
      }}>
        Создать обращение
      </button>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <Link to={`/chat/${request.id}`}>Обращение: {request.id}</Link>&nbsp;
            {request.unreadCount > 0 && (
              <button onClick={() => handleUnreadClick(request.id)}>
                Непрочитанные: {request.unreadCount}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Модальное окно */}
      {selectedChat && <ChatModal chatId={selectedChat} onClose={closeChat} currentUserId={user?.id|| 'Гость'} />}
    </div>
  );
};

export default ClientSupportPage;