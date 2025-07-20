import React from 'react';
import ReactDOM from 'react-dom/client'; // Измените импорт
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles.css'; // добавьте стили по необходимости

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement); // Создайте корень

root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);