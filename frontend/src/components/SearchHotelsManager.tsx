import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AllHotelsApi } from '../API/Hotel/AllHotels.api';
import { HotelsDataApi, HotelRezApi, RoomDelApi, RoomSearchApi } from '../API/Hotel/AllHotelsReserv.api';
import { ProfileListApi } from '../API/User/ProfileList.api'; // Импортируем API для профиля
import { ReservationWithDetails } from '../../../backend/src/modules/reservation/interfaces/reservation.interface';
import { Hotel } from '../../../backend/src/modules/hotel/schemas/hotel.schema';

const SearchHotelsManager = () => {
    const { isAuthenticated } = useAuth();
    const [hotelName, setHotelName] = useState('');
    const [hotelId, setHotelId] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [availableReservations, setAvailableReservations] = useState<ReservationWithDetails[]>([]);
    const [isBooked, setIsBooked] = useState(true);
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const hotels = await AllHotelsApi.getAllHotels();
                setAllHotels(hotels);
            } catch (error) {
                console.error("Ошибка при загрузке гостиниц:", error);
            }
        };

        fetchHotels();
    }, []);

    const fetchUserDetails = async (userId: string) => {
        try {
            return await ProfileListApi.fetchUserInfo(userId); // Запрашиваем информацию о пользователе
        } catch (error) {
            console.error("Ошибка при получении информации о пользователе:", error);
            return null;
        }
    };

    const fetchRoomDetails = async (roomId: string) => {
        try {
            return await RoomSearchApi.fetchHotelRoomSearch(roomId); // Запрашиваем информацию о номере
        } catch (error) {
            console.error("Ошибка при получении информации о номере:", error);
            return null;
        }
    };

    const handleSearch = async () => {
        let reservations;

        try {
            if (hotelName) {
                const hotel = allHotels.find(h => h.title.toLowerCase() === hotelName.toLowerCase());
                if (hotel) {
                    setHotelId(hotel.id || '');
                } else {
                    alert("Гостиница не найдена.");
                    return;
                }
            }

            if (hotelId && !dateStart && !dateEnd) {
                reservations = isBooked 
                    ? await HotelRezApi.fetchAvailableHotel(hotelId) 
                    : await HotelsDataApi.fetchAvailableHotelsByName(hotelId);
            } else if (!hotelId && dateStart && dateEnd) {
                reservations = isBooked 
                    ? await HotelsDataApi.fetchAvailableHotels(dateStart, dateEnd) 
                    : await HotelsDataApi.fetchFreeHotels(dateStart, dateEnd);
            } else if (hotelId && dateStart && dateEnd) {
                reservations = isBooked 
                    ? await HotelRezApi.fetchAvailableHotelByNameAndDates(hotelId, dateStart, dateEnd)
                    : await HotelsDataApi.fetchFreeHotelsByNameAndDates(hotelId, dateStart, dateEnd);
            } else {
                alert("Пожалуйста, заполните хотя бы одно поле для поиска.");
                return;
            }

            if (Array.isArray(reservations)) {
                // Получаем дополнительные детали для каждого бронирования (номера и пользователя)
                const detailedReservations = await Promise.all(reservations.map(async (reservation) => {
                    const userDetails = await fetchUserDetails(reservation.userId); // Запрашиваем информацию о пользователе
                    const roomDetails = await fetchRoomDetails(reservation.roomId); // Запрашиваем информацию о номере
                    return {
                        ...reservation,
                        user: userDetails || reservation.user, // Если произошла ошибка, оставляем текущее значение
                        room: roomDetails ? roomDetails : reservation.room
                    };
                }));
                
                setAvailableReservations(detailedReservations);
            } else {
                console.warn("Получены некорректные данные:", reservations);
                setAvailableReservations([]);
            }
        } catch (error) {
            console.error("Ошибка во время поиска:", error);
            alert("Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз.");
        }
    };

    const handleReset = () => {
        setHotelName('');
        setHotelId('');
        setDateStart('');
        setDateEnd('');
        setAvailableReservations([]);
        setIsBooked(true);
    };

    const handleCancelReservation = async (roomId: string) => {
        try {
            await RoomDelApi.fetchHotelRoomDel(roomId);
            handleSearch();
        } catch (error) {
            alert("Ошибка при аннулировании брони.");
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Управление бронированиями</h1>
            <input 
                type="text" 
                placeholder="Введите название гостиницы"
                value={hotelName} 
                onChange={(e) => setHotelName(e.target.value)}
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
            <label>
                <input 
                    type="checkbox" 
                    checked={isBooked}
                    onChange={(e) => setIsBooked(e.target.checked)}
                />
                Забронированные
            </label>
            <button onClick={handleSearch}>Искать</button>
            <button onClick={handleReset}>Сбросить</button>

            {availableReservations.length > 0 && (
                <div>
                    <h2>Результаты:</h2>
                    <ul>
                        {availableReservations.map((reservation) => (
                            <li key={reservation.roomId}>
                                <strong>Гостиница: {reservation.hotel.title}</strong>
                                <p>Имя номера: {reservation.room.description}</p>
                                <p>Дата заезда: {reservation.dateStart}</p>
                                <p>Дата выезда: {reservation.dateEnd}</p>
                                <p>Имя пользователя: {reservation.user.name}</p>
                                <p>Номер телефона: {reservation.user.contactPhone}</p>
                                <p>Электронная почта: {reservation.user.email}</p>
                                <button onClick={() => handleCancelReservation(reservation.roomId)}>Аннулировать бронь</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchHotelsManager;