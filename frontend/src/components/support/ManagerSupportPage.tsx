import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SupportChatService from '../../services/SupportChatService';

const ManagerSupportPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    SupportChatService.getManagerSupportRequests().then(setRequests);
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