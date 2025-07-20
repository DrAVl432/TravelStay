import React from 'react';
import { useLocation } from 'react-router-dom';
import HotelsList from '../components/HotelsList';

const Home = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/'; // Проверяем, находимся ли мы на главной странице

    return (
        <div id="container">
            <div id="main">
                {isHomePage ? (
                    <img src="default_image.jpg" alt="Default Image" />
                ) : (
                    <HotelsList /> // Отображаем список гостиниц, если не на главной странице
                )}
            </div>
        </div>
    );
};

export default Home;