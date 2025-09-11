import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SupportChatService from '../../API/support/SupportChatService';

interface ManagerSupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
  client: {
    id: string;
    name: string;
  };
}

const ManagerSupportPage: React.FC = () => {
  const [requests, setRequests] = useState<ManagerSupportRequest[]>([]);

  useEffect(() => {
    SupportChatService.getManagerSupportRequests().then(setRequests).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Обращения пользователей</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <Link to={`/chat/${request.id}`}>
              Обращение: {request.id}, Клиент: {request.client.name}, Активно: {request.isActive ? 'Да' : 'Нет'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagerSupportPage;