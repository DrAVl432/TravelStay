import React, { useEffect, useMemo, useRef, useState } from 'react';
import SupportChatService from '../../API/support/SupportChatService';
import { UserListApi } from '../../API/User/UserList.api';
import SocketService from './SocketService';
import { UserRole } from '../../../../backend/src/modules/user/enums/user-role.enum';

interface Message {
  _id: string;
  text: string;
  sentAt: string | number | Date;
  readAt?: string | number | Date;
  author: any; // приходит из сокета в разных форматах
}

interface User {
  _id: string;
  name: string;
  role?: UserRole;
}

interface ChatWindowProps {
  id: string;
  currentUserId: string;
}

// достать строковый ObjectId из разных возможных структур
const extractId = (val: any): string | null => {
  if (!val) return null;

  if (typeof val === 'string') return val.trim();

  if (typeof val === 'number') return String(val);

  if (typeof val === 'object') {
    // Самый частый кейс: { _id: '...' }
    if (typeof val._id === 'string') return val._id.trim();

    // { id: '...' }
    if (typeof val.id === 'string') return val.id.trim();

    // Mongo Extended JSON: { _id: { $oid: '...' } }
    if (val._id && typeof val._id.$oid === 'string') return val._id.$oid.trim();

    // Некоторые драйверы: { _id: { toString() } }
    if (val._id && typeof val._id.toString === 'function') {
      const s = String(val._id.toString()).trim();
      if (s && s !== '[object Object]') return s;
    }

    // Сам объект может иметь toString верный
    if (typeof val.toString === 'function') {
      const s = String(val.toString()).trim();
      if (s && s !== '[object Object]') return s;
    }
  }

  return null;
};

const normalizeId = (val: any): string => extractId(val) ?? '';

const normalizeUser = (u: any): User => ({
  _id: normalizeId(u?._id ?? u?.id ?? u),
  name: String(u?.name ?? ''),
  role: u?.role,
});

const ChatWindow: React.FC<ChatWindowProps> = ({ id, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requestText, setRequestText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      const key = normalizeId(u._id);
      if (key) map.set(key, u);
    }
    return map;
  }, [users]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Инициализация
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [msgs, req, userList] = await Promise.all([
          SupportChatService.getMessages(id),
          SupportChatService.getSupportRequestDetails(id),
          UserListApi.fetchUsersInfo(),
        ]);
        if (!isMounted) return;

        const msgsNormalized = (msgs ?? []).map((m: any) => ({
          ...m,
          author: normalizeId(m.author),
        }));

        setMessages(msgsNormalized);
        setRequestText(req?.text ?? '');
        setUsers((userList ?? []).map(normalizeUser));
      } catch (e) {
        console.error('[ChatWindow] Инициализация:', e);
      }
    })();

    SocketService.connect(currentUserId);

    return () => {
      isMounted = false;
      SocketService.disconnect();
    };
  }, [id, currentUserId]);

  // Подписка на чат
  useEffect(() => {
    let cancelled = false;

    const handleNewMessage = async (incoming: Message) => {
      if (cancelled) return;

      // Жестко нормализуем author
      const authorId = normalizeId(incoming.author);
      const newMessage: Message = { ...incoming, author: authorId };

      // Диагностика: покажем сырое значение и нормализованное
      try {
        console.log('[WS] raw author =', incoming.author, 'normalized =', authorId, 'users keys =', [...usersById.keys()]);
      } catch {}

      // Если автор неизвестен — подтягиваем
      if (authorId && !usersById.has(authorId)) {
        try {
          const fetched = await UserListApi.fetchUserById(authorId);
          if (cancelled) return;
          const normalizedFetched = normalizeUser(fetched);
          setUsers(prev => (prev.some(u => normalizeId(u._id) === normalizedFetched._id) ? prev : [...prev, normalizedFetched]));
        } catch (error) {
          console.error('[ChatWindow] Ошибка загрузки пользователя:', error, 'authorId=', authorId);
        }
      }

      setMessages(prev => [...prev, newMessage]);
    };

    SocketService.subscribeToChat(id, handleNewMessage);

    return () => {
      cancelled = true;
      SocketService.unsubscribeFromChat(handleNewMessage);
    };
  }, [id, usersById]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAuthorName = (authorIdRaw: any): string => {
    const authorId = normalizeId(authorIdRaw);
    const user = usersById.get(authorId);
    return user ? user.name : 'Загрузка...';
  };

  const currentUserIdNorm = normalizeId(currentUserId);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Обращение: {requestText}</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => {
          const msgAuthorNorm = normalizeId(msg.author);
          return (
            <div key={msg._id}>
              <div className={`message-container ${msgAuthorNorm === currentUserIdNorm ? 'current-user' : 'other-user'}`}>
                {msgAuthorNorm !== currentUserIdNorm && (
                  <div className="message-author">{getAuthorName(msg.author)}</div>
                )}
                <div className="message">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;