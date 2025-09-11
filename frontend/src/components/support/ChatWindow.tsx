import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SupportChatService from '../../API/support/SupportChatService';
import SocketService from '../../components/support/SocketService'; 
import { useAuth } from '../../context/AuthContext';

// Интерфейсы для структуры сообщения и параметров
interface APIMessage {
  id: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  sentAt: string; // ISO string от API
  readAt?: string; // ISO string от API
}

interface Message {
  id: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  sentAt: Date; // Локальная обработка как Date
  readAt?: Date; // Локальная обработка как Date | undefined
}

const ChatWindow: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Типизация для параметра, ожидающего chatId
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]); // Список сообщений
  const [text, setText] = useState<string>(''); // Поле ввода текста

  // Метод для преобразования сообщения из API в локальный формат
  const parseMessage = (apiMessage: APIMessage): Message => ({
    ...apiMessage,
    sentAt: new Date(apiMessage.sentAt),
    readAt: apiMessage.readAt ? new Date(apiMessage.readAt) : undefined,
  });

  useEffect(() => {
    if (user?.id) {
      SocketService.connect(user.id); // Устанавливаем соединение с WebSocket-сервером

      // Подписка на получение новых сообщений через WebSocket
      SocketService.subscribeToChat(id!, (newMessage: APIMessage) => {
        setMessages((prev) => [...prev, parseMessage(newMessage)]);
      });

      // Загружаем историю чата
      SupportChatService.getMessages(id!)
        .then((apiMessages) => apiMessages.map(parseMessage)) // Преобразуем серверные данные
        .then(setMessages) // Устанавливаем локальное состояние
        .catch(console.error);

      // Отключить WebSocket при выходе из компонента
      return () => {
        SocketService.disconnect();
      };
    }
  }, [id, user]);

const sendMessage = async () => {
  if (text.trim() && user?.id) {
    try {
      await SupportChatService.sendMessage(id!, user.id, text); // Передаём user.id как автора
      setText(''); // Очищаем поле ввода
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  }
};

  return (
    <div>
      <h2>Общение в чате</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <p>
              <b>{msg.author.name}:</b> {msg.text}
            </p>
            <p>{msg.sentAt.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст..."
      />
      <button onClick={sendMessage}>Отправить</button>
    </div>
  );
};

export default ChatWindow;