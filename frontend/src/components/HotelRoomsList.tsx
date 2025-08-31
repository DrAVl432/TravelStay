import React, { useEffect, useState } from 'react';
import { Hotel } from '../types/Hotel.types';
import { HotelRoomsApi } from '../API/Hotel/HotelRooms.api';
import '../styles.css';

interface HotelRoom {
  id: string;
  description?: string;
  images: string[];
  isEnabled: boolean;
}

interface HotelRoomsListProps {
  hotel: Hotel; // Используем тип Hotel из Hotel.types.ts
  onClose: () => void;
}

const HotelRoomsList: React.FC<HotelRoomsListProps> = ({ hotel, onClose }) => {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await HotelRoomsApi.getRoomsByHotel(hotel._id);
        setRooms(fetchedRooms);
      } catch (error) {
        setError('Не удалось получить номера отеля');
        console.error('Ошибка при получении номеров отеля:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hotel._id) {
      fetchRooms();
    } else {
      setError('Некорректный ID отеля');
      setLoading(false);
    }
  }, [hotel._id]);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="room-list">
      <button className="back-button" onClick={onClose}>
        Назад
      </button>
      <div className="hotel-info">
        <h2>{hotel.title}</h2>
        <p>{hotel.description}</p>
        {hotel.images.length > 0 && (
          <img src={hotel.images[0]} alt={hotel.title} className="hotel-image" />
        )}
      </div>
      <h3>Список номеров:</h3>
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room.id} className="room-card">
            {room.images.length > 0 ? (
              <img src={room.images[0]} alt={`Room ${room.id}`} />
            ) : (
              <p>Изображение недоступно</p>
            )}
            <p>{room.description || 'Описание отсутствует'}</p>
            <p>{room.isEnabled ? 'Доступен' : 'Не доступен'}</p>
          </div>
        ))
      ) : (
        <p>Нет доступных номеров для этого отеля.</p>
      )}
    </div>
  );
};

export default HotelRoomsList;