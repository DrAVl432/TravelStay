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
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    SupportChatService.getManagerSupportRequests()
      .then(setRequests)
      .catch(console.error);
  }, []);

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === 'all') return true;
    return statusFilter === 'open' ? request.isActive : !request.isActive;
  });

  return (
    <div>
      <h2>Обращения пользователей</h2>
      <label>
        Фильтр по статусу:
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">Все</option>
          <option value="open">Открытые</option>
          <option value="closed">Закрытые</option>
        </select>
      </label>
      <ul>
        {filteredRequests.map((request) => (
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