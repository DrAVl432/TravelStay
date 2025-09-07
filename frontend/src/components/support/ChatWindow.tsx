import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SupportChatService from '../../services/SupportChatService';
import SocketService from '../../services/SocketService';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = () => {
  const { id } = useParams(); // ID обращения
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    SocketService.connect(user.id);
    SocketService.subscribeToChat(id, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    SupportChatService.getMessages(id).then(setMessages);

    return () => {
      SocketService.disconnect();
    };
  }, [id]);

  const sendMessage = async () => {
    await SupportChatService.sendMessage(id, text);
    setText('');
  };

  return (
    <div>
      <h2>Общение в чате</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <p><b>{msg.author.name}:</b> {msg.text}</p>
            <p>{new Date(msg.sentAt).toLocaleString()}</p>
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