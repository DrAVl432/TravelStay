import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SupportChatService from '../../services/SupportChatService';
import { useAuth } from '../../context/AuthContext';

const ClientSupportPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    SupportChatService.getClientSupportRequests().then(setRequests);
  }, []);

  const createSupportRequest = async () => {
    const newRequest = prompt('Введите текст обращения:');
    if (newRequest) {
      await SupportChatService.createSupportRequest(newRequest);
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