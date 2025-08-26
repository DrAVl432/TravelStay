import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, userRole, logout } = useAuth();
        const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/"); // Переход на главную страницу после выхода
    };

    return (
        <header>
            <h2>TravelStay</h2>
            <nav>
                <ul>
                    <li><Link to="/">Главная страница</Link></li>
                    <li><Link to="/AllHotels">Гостиницы</Link></li>
                    <div className="auth-buttons">
                        {isAuthenticated ? (
                            <>
                                {userRole === 'client' && (
                                    <>
                                        <li><Link to="/chat">Чат техподдержки</Link></li>
                                        <li><Link to="/Profile">Профиль</Link></li>
                                        <li><Link to="/MyReservations">Мои брони</Link></li>
                                    </>
                                )}
                                {userRole === 'manager' && (
                                    <>
                                        <li><Link to="/Users">Список пользователей</Link></li>
                                        <li><Link to="/Bookings">Список броней</Link></li>
                                        <li><Link to="/Requests">Список обращений</Link></li>
                                        <li><Link to="/Profile">Профиль</Link></li>
                                    </>
                                )}
                                {userRole === 'admin' && (
                                    <>
                                        <li><Link to="/Users">Список пользователей</Link></li>
                                        <li><Link to="/Profile">Профиль</Link></li>
                                    </>
                                )}
                                <button onClick={handleLogout}>Выйти</button>
                            </>
                        ) : (
                            <ul>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </ul>
                        )}
                    </div>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;