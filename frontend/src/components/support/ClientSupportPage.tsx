import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatModal from '../support/ChatModal';
import SupportChatService from '../../API/support/SupportChatService';

type StatusFilter = 'all' | 'open' | 'closed';

interface SupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
  firstMessage?: string;
  // Бэкенд может вернуть либо unreadCountFromManager (предпочтительно),
  // либо общий unreadCount — нормализуем в unreadCountFromManager
  unreadCountFromManager?: number;
  unreadCount?: number;
}

const ClientSupportPage: React.FC = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await SupportChatService.getClientSupportRequests(user.id);
      const normalized: SupportRequest[] = (data || []).map((r: any) => ({
        ...r,
        firstMessage: r.firstMessage ?? '',
        unreadCountFromManager:
          typeof r.unreadCountFromManager === 'number'
            ? r.unreadCountFromManager
            : (typeof r.unreadCount === 'number' ? r.unreadCount : 0),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Автообновление при возврате/фокусе
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'open' ? request.isActive : !request.isActive;
    });
  }, [requests, statusFilter]);

  const openChat = (requestId: string) => {
    setSelectedChat(requestId);
  };

  const closeChat = async () => {
    setSelectedChat(null);
    await fetchRequests(); // после закрытия обновим счетчики
  };

  const handleCreateRequest = async () => {
    const newRequest = prompt('Введите текст обращения:');
    if (newRequest && user?.id) {
      try {
        await SupportChatService.createSupportRequest(user.id, newRequest);
        await fetchRequests();
      } catch (e) {
        console.error(e);
        alert('Ошибка при создании обращения');
      }
    }
  };

  return (
    <div>
      <h2>Мои обращения</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={handleCreateRequest}>Создать обращение</button>

        <label>
          Фильтр по статусу:{' '}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">Все</option>
            <option value="open">Открытые</option>
            <option value="closed">Закрытые</option>
          </select>
        </label>
      </div>

      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 900,
            }}
          >
            <thead>
              <tr>
                <th style={th}>№ обращения</th>
                <th style={th}>Обращение</th>
                <th style={th}>Статус обращения</th>
                <th style={th}>количество не прочитанных сообщений собеседника</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td style={td} colSpan={4}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={td}>
                      <button
                        onClick={() => openChat(req.id)}
                        title="Открыть чат"
                        style={linkLikeBtn}
                      >
                        {req.id}
                      </button>
                    </td>
                    <td style={td}>{req.firstMessage || '—'}</td>
                    <td style={td}>{req.isActive ? 'Открыто' : 'Закрыто'}</td>
                    <td style={td}>
                      {(req.unreadCountFromManager ?? 0) > 0 ? (
                        <button
                          onClick={() => openChat(req.id)}
                          title="Перейти в чат"
                          style={pillBtn}
                        >
                          {req.unreadCountFromManager}
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
          currentUserId={user?.id || 'Гость'}
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

export default ClientSupportPage;