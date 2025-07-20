import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    user: any; 
    login: (userData: any) => void; 
    logout: () => void;
    isAuthenticated: boolean; // Добавляем свойство isAuthenticated
    userRole?: 'client' | 'manager' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null); 
    const isAuthenticated = user !== null; // Устанавливаем значение isAuthenticated

    const login = (userData: any) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };
    const userRole = user?.role;
    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;