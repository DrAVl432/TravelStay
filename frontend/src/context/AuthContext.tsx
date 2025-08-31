import React, { createContext, useContext, useState, ReactNode } from 'react';

// Типизация для данных авторизации
interface User {
  id: string; // ID пользователя
  role?: 'client' | 'manager' | 'admin'; // Роль пользователя, если есть
  username?: string; // Имя пользователя, если нужно
}

// Типизация контекста
interface AuthContextType {
  user: User | null; // Текущий авторизованный пользователь или null
  login: (userData: User) => void; // Функция входа (установка пользователя)
  logout: () => void; // Функция выхода (очистка пользователя)
  isAuthenticated: boolean; // Указание, авторизован ли пользователь
  userRole?: 'client' | 'manager' | 'admin'; // Роль пользователя, если нужно
}

// Создание контекста с начальным значением undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер для использования контекста
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Текущее состояние пользователя

  const isAuthenticated = user !== null; // Проверка авторизации

  // Функция для входа (устанавливает данные пользователя)
  const login = (userData: User) => {
    setUser(userData);
  };

  // Функция для выхода (очищает данные о пользователе)
  const logout = () => {
    setUser(null);
  };

  const userRole = user?.role; // Получаем текущую роль пользователя, если есть

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Создание пользовательского хука для удобного использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;