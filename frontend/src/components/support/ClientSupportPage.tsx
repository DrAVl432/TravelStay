import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SupportChatService from '../../API/support/SupportChatService';
import { useAuth } from '../../context/AuthContext';

interface SupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
}

const ClientSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    if (user?.id) {
      SupportChatService.getClientSupportRequests().then(setRequests).catch(console.error);
    }
  }, [user]);

const createSupportRequest = async () => {
  const newRequest = prompt('Введите текст обращения:');
  if (newRequest && user?.id) {
    await SupportChatService.createSupportRequest(user.id, newRequest); // Передаём user.id
    const updatedRequests = await SupportChatService.getClientSupportRequests();
    setRequests(updatedRequests);
    }
  };

  return (
    <div>
      <h2>Мои обращения</h2>
      <button onClick={createSupportRequest}>Создать обращение</button>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <Link to={`/chat/${request.id}`}>
              Обращение: {request.id}, Активно: {request.isActive ? 'Да' : 'Нет'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientSupportPage;