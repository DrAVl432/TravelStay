import React, { useEffect, useState } from 'react';
import { HotelRoomsApi } from '../API/Hotel/HotelRooms.api';
import '../styles.css';

interface HotelRoom {
    id: string;
    description?: string;
    images: string[];
    isEnabled: boolean;
}

interface HotelRoomsListProps {
    hotelId: string;
    onClose: () => void;
}

const HotelRoomsList: React.FC<HotelRoomsListProps> = ({ hotelId, onClose }) => {
    const [rooms, setRooms] = useState<HotelRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Добавлено для обработки ошибок

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const fetchedRooms = await HotelRoomsApi.getRoomsByHotel(hotelId);
                setRooms(fetchedRooms);
            } catch (error) {
                setError('Не удалось получить номера отеля'); // Обработка ошибки
                console.error('Ошибка при получении номеров отеля:', error);
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            fetchRooms();
        } else {
            setError('Некорректный ID отеля'); // Проверка на пустой hotelId
            setLoading(false);
        }
    }, [hotelId]);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>{error}</p>; // Отображение ошибки
    }

    return (
        <div className="room-list">
            <button onClick={onClose}>Назад</button>
            {rooms.length > 0 ? (
                rooms.map(room => (
                    <div key={room.id} className="room-card">
                        <img src={room.images[0]} alt={`Room ${room.id}`} />
                        <p>{room.description}</p>
                    </div>
                ))
            ) : (
                <p>Нет доступных номеров.</p>
            )}
        </div>
    );
};

export default HotelRoomsList;