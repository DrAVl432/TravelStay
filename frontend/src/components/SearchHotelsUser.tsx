import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AllHotelsReserv from '../API/AllHotelsReserv.api';
import { HotelWithId } from '../../../backend/src/modules/hotel/interfaces/hotel.interface'; // Импортируем новый интерфейс

const SearchHotelsUser = () => {
    const { isAuthenticated } = useAuth();
    const [hotelId, setHotelId] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [availableHotels, setAvailableHotels] = useState<HotelWithId[]>([]); // Используем HotelWithId

    const handleSearch = async () => {
        const today = new Date().toISOString().split('T')[0];

        if (dateStart && dateEnd) {
            if (new Date(dateStart) < new Date(today)) {
                alert("Дата заезда не может быть ранее текущей даты.");
                return;
            }
            if (new Date(dateEnd) <= new Date(dateStart)) {
                alert("Дата выезда должна быть позже даты заезда.");
                return;
            }

            // Получаем доступные гостиницы
            const hotels = await AllHotelsReserv.fetchAvailableHotels(dateStart, dateEnd);
            setAvailableHotels(hotels);
        } else {
            alert("Пожалуйста, укажите даты заезда и выезда.");
        }
    };

    return (
        <div>
            <h1>Поиск Гостиницы</h1>
            <input 
                type="text" 
                placeholder="Введите название гостиницы (необязательно)"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
            />
            <input 
                type="date" 
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
            />
            <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
            />
            <button onClick={handleSearch}>Искать</button>

            {availableHotels.length > 0 && (
                <div>
                    <h2>Доступные отели:</h2>
                    <ul>
                        {availableHotels.map((hotel) => (
                            <li key={hotel.id}>
                                <strong>{hotel.title}</strong>
                                {hotel.description && <p>{hotel.description}</p>}
                                {hotel.images && hotel.images.length > 0 && (
                                    <div>
                                        <h4>Изображения:</h4>
                                        <ul>
                                            {hotel.images.map((image, index) => (
                                                <li key={index}>
                                                    <img src={image} alt={hotel.title} style={{ width: '100px' }} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchHotelsUser;