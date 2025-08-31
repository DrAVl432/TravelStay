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

const HotelRoomsListAdmin: React.FC<HotelRoomsListProps> = ({ hotel, onClose }) => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotel]);

  const handleEditHotel = () => {
    console.log(`Редактирование отеля с ID: ${hotel._id}`);
  };

  const handleAddRoom = () => {
    console.log(`Добавление нового номера для отеля с ID: ${hotel._id}`);
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="hotel-container">
      <div className="hotel-header">
        <div className="hotel-images">
          {hotel.images.map((image, index) => (
            <img key={index} src={image} alt="Hotel" />
          ))}
        </div>
        <div className="hotel-info">
          <h1>{hotel.title}</h1>
          <p>{hotel.description || 'Описание отсутствует'}</p>
          <div className="hotel-buttons">
            <button onClick={handleEditHotel}>Редактировать</button>
            <button onClick={handleAddRoom}>Добавить номер</button>
          </div>
        </div>
      </div>
      <div className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-image">
                <img
                  src={room.images[0] || 'https://via.placeholder.com/150'}
                  alt={`Room ${room.id}`}
                />
              </div>
              <div className="room-info">
                <h2>{room.description || 'Описание отсутствует'}</h2>
                <button>Редактировать номер</button>
              </div>
            </div>
          ))
        ) : (
          <p>Нет доступных номеров.</p>
        )}
      </div>
      <button className="back-button" onClick={onClose}>
        Назад
      </button>
    </div>
  );
};

export default HotelRoomsListAdmin;