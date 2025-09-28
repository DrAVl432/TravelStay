import React, { useEffect, useMemo, useState } from 'react';
import ChatModal from '../support/ChatModal';
import SupportChatService from '../../API/support/SupportChatService';
import { useAuth } from '../../context/AuthContext';

type StatusFilter = 'all' | 'open' | 'closed';

interface ManagerSupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
  client: {
    id: string;
    name: string;
    contactPhone?: string;
    email?: string;
  };
  firstMessage?: string;
  unreadCountFromClient?: number;
}

const ManagerSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ManagerSupportRequest[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerId = useMemo(() => (user?.id ? String(user.id) : ''), [user?.id]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupportChatService.getManagerSupportRequests();
      const normalized: ManagerSupportRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        createdAt: r.createdAt,
        isActive: r.isActive,
        client: r.client,
        firstMessage: r.firstMessage ?? '',
        unreadCountFromClient: Number(r.unreadCountFromClient ?? r.unreadCount ?? 0),
      }));
      setRequests(normalized);
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить обращения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchRequests();
    };
    const onPop = () => fetchRequests();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('popstate', onPop);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'open' ? request.isActive : !request.isActive;
    });
  }, [requests, statusFilter]);

  const openChat = (requestId: string) => setSelectedChat(requestId);

  const closeChat = async () => {
    setSelectedChat(null);
    await fetchRequests();
  };

  const syncRequests = async () => {
    await fetchRequests();
  };

  return (
    <div>
      <h2>Обращения пользователей</h2>

      <label>
        Фильтр по статусу:{' '}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">Все</option>
          <option value="open">Открытые</option>
          <option value="closed">Закрытые</option>
        </select>
      </label>

      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>№ обращения</th>
                <th style={th}>Обращение</th>
                <th style={th}>Имя</th>
                <th style={th}>номер телефона</th>
                <th style={th}>mail</th>
                <th style={th}>Статус обращения</th>
                <th style={th}>Непрочитанные от клиента</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td style={td} colSpan={7}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={td}>
                      <button onClick={() => openChat(req.id)} title="Открыть чат" style={linkLikeBtn}>
                        {req.id}
                      </button>
                    </td>
                    <td style={td}>{req.firstMessage || '—'}</td>
                    <td style={td}>{req.client?.name ?? '—'}</td>
                    <td style={td}>{req.client?.contactPhone ?? '—'}</td>
                    <td style={td}>{req.client?.email ?? '—'}</td>
                    <td style={td}>{req.isActive ? 'Открыто' : 'Закрыто'}</td>
                    <td style={td}>
                      {(req.unreadCountFromClient ?? 0) > 0 ? (
                        <button onClick={() => openChat(req.id)} title="Перейти в чат" style={pillBtn}>
                          {req.unreadCountFromClient}
                        </button>
                      ) : (
                        0
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedChat && (
        <ChatModal
          chatId={selectedChat}
          onClose={closeChat}
          currentUserId={managerId}
          onSync={syncRequests}
        />
      )}
    </div>
  );
};

const th: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  background: '#f7f7f7',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  border: '1px solid #eee',
  padding: '8px',
  verticalAlign: 'top',
};

const pillBtn: React.CSSProperties = {
  border: 'none',
  borderRadius: 16,
  padding: '4px 10px',
  background: '#1976d2',
  color: '#fff',
  cursor: 'pointer',
};

const linkLikeBtn: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#1976d2',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
};

export default ManagerSupportPage;