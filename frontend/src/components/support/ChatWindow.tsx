import React, { useEffect, useMemo, useRef, useState } from 'react';
import SupportChatService, { ChatMessage } from '../../API/support/SupportChatService';
import { UserListApi } from '../../API/User/UserList.api';
import SocketService from './SocketService';
import { UserRole } from '../../../../backend/src/modules/user/enums/user-role.enum';

interface User {
  _id: string;
  name: string;
  role?: UserRole;
}

interface ChatWindowProps {
  id: string;
  currentUserId: string;
  onReadSync?: () => void;         // вызовем после успешного markRead, чтобы родитель обновил список
  onStatusChange?: (isActive: boolean) => void; // сообщим о статусе обращения
}

const normalizeId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (typeof val._id === 'string') return val._id.trim();
    if (typeof val.id === 'string') return val.id.trim();
    if (val._id && typeof val._id.$oid === 'string') return val._id.$oid.trim();
    if (val._id && typeof val._id.toString === 'function') {
      const s = String(val._id.toString()).trim();
      if (s && s !== '[object Object]') return s;
    }
    if (typeof val.toString === 'function') {
      const s = String(val.toString()).trim();
      if (s && s !== '[object Object]') return s;
    }
  }
  return '';
};

const normalizeUser = (u: any): User => ({
  _id: normalizeId(u?._id ?? u?.id ?? u),
  name: String(u?.name ?? ''),
  role: u?.role,
});

const ChatWindow: React.FC<ChatWindowProps> = ({ id, currentUserId, onReadSync, onStatusChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requestText, setRequestText] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      const key = normalizeId(u._id);
      if (key) map.set(key, u);
    }
    return map;
  }, [users]);

  const currentUserIdNorm = normalizeId(currentUserId);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const markAllAsRead = async (upto?: Date) => {
    if (!messages.length) return;
    const lastTime = upto ?? new Date(messages[messages.length - 1].sentAt);
    await SupportChatService.markMessagesAsRead(currentUserIdNorm, id, lastTime);
    onReadSync?.();
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [{ isActive, messages }, req, userList] = await Promise.all([
          SupportChatService.getMessages(id),
          SupportChatService.getSupportRequestDetails(id),
          UserListApi.fetchUsersInfo(),
        ]);

        if (!isMounted) return;

        setMessages(
          (messages ?? []).map((m) => ({
            ...m,
            author: normalizeId(m.author),
          }))
        );

        setRequestText((req as any)?.firstMessage ?? '');
        setIsActive(isActive);
        onStatusChange?.(isActive);

        setUsers((userList ?? []).map(normalizeUser));

        if ((messages ?? []).length > 0) {
          const lastTime = new Date(messages[messages.length - 1].sentAt);
          await SupportChatService.markMessagesAsRead(currentUserIdNorm, id, lastTime);
          onReadSync?.();
        }
      } catch (e) {
        console.error('[ChatWindow] init:', e);
      }
    })();

    SocketService.connect(currentUserIdNorm);

    return () => {
      isMounted = false;
      SocketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUserIdNorm]);

  useEffect(() => {
    const handleNewMessage = async (incoming: any) => {
      const authorId = normalizeId(incoming.author);
      const newMessage: ChatMessage = {
        _id: String(incoming._id ?? incoming.id ?? Date.now()),
        text: incoming.text,
        sentAt: incoming.sentAt,
        readAt: incoming.readAt ?? null,
        author: authorId,
      };

      if (authorId && !usersById.has(authorId)) {
        try {
          const fetched = await UserListApi.fetchUserById(authorId);
          const normalizedFetched = normalizeUser(fetched);
          setUsers((prev) => (prev.some((u) => normalizeId(u._id) === normalizedFetched._id) ? prev : [...prev, normalizedFetched]));
        } catch (error) {
          console.error('[ChatWindow] user fetch error:', error);
        }
      }

      setMessages((prev) => [...prev, newMessage]);

      // входящее — помечаем до этого сообщения
      if (authorId && authorId !== currentUserIdNorm) {
        try {
          const createdBefore = new Date(newMessage.sentAt);
          await SupportChatService.markMessagesAsRead(currentUserIdNorm, id, createdBefore);
          onReadSync?.();
        } catch (e) {
          console.error('[ChatWindow] markAsRead incoming:', e);
        }
      }
    };

    SocketService.subscribeToChat(id, handleNewMessage);
    return () => {
      SocketService.unsubscribeFromChat(handleNewMessage);
    };
  }, [id, usersById, currentUserIdNorm, onReadSync]);

  useEffect(() => {
    scrollToBottom();
    // когда дорисовали — подстрахуемся и отметим все
    markAllAsRead().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const getAuthorName = (authorIdRaw: any): string => {
    const authorId = normalizeId(authorIdRaw);
    const user = usersById.get(authorId);
    return user ? user.name : 'Загрузка...';
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Обращение: {requestText}</h3>
        {!isActive && <div style={{ color: '#c00', fontSize: 12 }}>Обращение закрыто</div>}
      </div>
      <div className="chat-messages">
        {messages.map((msg) => {
          const mine = msg.author === currentUserIdNorm;
          return (
            <div key={msg._id}>
              <div className={`message-container ${mine ? 'current-user' : 'other-user'}`}>
                {!mine && <div className="message-author">{getAuthorName(msg.author)}</div>}
                <div className="message">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
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