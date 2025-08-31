import React, { useEffect, useMemo, useState } from 'react';
import { Hotel } from '../types/Hotel.types';
import { HotelRoomsApi } from '../API/Hotel/HotelRooms.api';
import { HotelRezApi } from '../API/Hotel/AllHotelsReserv.api';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

interface HotelRoom {
  _id?: string;        // IMPORTANT: если приходит из БД
  id?: string;         // на случай, если API возвращает id
  description?: string;
  images: string[];
}

interface HotelRoomsListProps {
  hotel: Hotel;
  onClose: () => void;
}

interface RoomDates {
  checkInDate: string;
  checkOutDate: string;
}

// Вынесли карточку в отдельный компонент без key внутри
const RoomCard: React.FC<{
  room: HotelRoom;
  dates: RoomDates | undefined;
  onDateChange: (roomKey: string, field: 'checkInDate' | 'checkOutDate', value: string) => void;
  onBook: (roomKey: string) => Promise<void>;
  isDisabled: (roomKey: string) => boolean;
  roomKey: string; // IMPORTANT: стабильный ключ, передаем явно
}> = ({ room, dates, onDateChange, onBook, isDisabled, roomKey }) => {
  return (
    <div className="room-card">
      <div className="room-image">
        <img
          src={room.images?.[0] || 'https://via.placeholder.com/600x400?text=Room'}
          alt="Room"
        />
      </div>
      <div className="room-info">
        <h2>{room.description || 'Описание отсутствует'}</h2>
        <div className="booking-fields">
          <input
            type="date"
            placeholder="Дата заезда"
            value={dates?.checkInDate || ''}
            onChange={(e) => onDateChange(roomKey, 'checkInDate', e.target.value)}
          />
          <input
            type="date"
            placeholder="Дата выезда"
            value={dates?.checkOutDate || ''}
            onChange={(e) => onDateChange(roomKey, 'checkOutDate', e.target.value)}
          />
        </div>
        <button onClick={() => onBook(roomKey)} disabled={isDisabled(roomKey)}>
          Бронировать
        </button>
      </div>
    </div>
  );
};

const HotelRoomsListClient: React.FC<HotelRoomsListProps> = ({ hotel, onClose }) => {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roomDates, setRoomDates] = useState<Record<string, RoomDates>>({});
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    let mounted = true;
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await HotelRoomsApi.getRoomsByHotel(hotel._id);
        if (!mounted) return;
        setRooms(fetchedRooms || []);
      } catch (err) {
        if (!mounted) return;
        setError('Не удалось получить номера отеля');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRooms();
    return () => {
      mounted = false;
    };
  }, [hotel]);

  // IMPORTANT: вычисляем стабильный ключ для каждого номера
  const getRoomKey = (room: HotelRoom) => {
    // приоритет _id, затем id, затем fallback
    return room._id || room.id || `${hotel._id}::${room.description || 'room'}::${room.images?.[0] || 'img'}`;
  };

  // Создадим карту ключей для удобства
  const roomKeys = useMemo(
    () => rooms.map((r) => getRoomKey(r)),
    [rooms]
  );

  const handleBooking = async (roomKey: string) => {
    const current = roomDates[roomKey] || { checkInDate: '', checkOutDate: '' };
    const { checkInDate, checkOutDate } = current;

    if (!checkInDate || !checkOutDate) {
      alert('Заполните даты для бронирования!');
      return;
    }

    if (!userId) {
      alert('Вы должны быть авторизованы для бронирования номера!');
      return;
    }

    // Находим сам room по ключу чтобы взять его настоящий id для запроса
    const room = rooms.find((r) => getRoomKey(r) === roomKey);
    if (!room) {
      alert('Номер не найден. Обновите страницу.');
      return;
    }

    const realRoomId = room._id || room.id;
    if (!realRoomId) {
      alert('Отсутствует идентификатор номера.');
      return;
    }

    try {
      const reservationData = {
        roomId: realRoomId,
        userId,
        hotelId: hotel._id,
        dateStart: checkInDate,
        dateEnd: checkOutDate,
      };

      const response = await HotelRezApi.createReservation(reservationData);

      if (response) {
        alert('Бронирование успешно создано!');
        setRoomDates((prev) => ({
          ...prev,
          [roomKey]: { checkInDate: '', checkOutDate: '' },
        }));
      }
    } catch (error) {
      console.error('Ошибка при создании бронирования:', error);
      alert('Не удалось создать бронирование. Попробуйте снова.');
    }
  };

  const handleDateChange = (roomKey: string, field: 'checkInDate' | 'checkOutDate', value: string) => {
    setRoomDates((prev) => ({
      ...prev,
      [roomKey]: { ...(prev[roomKey] || { checkInDate: '', checkOutDate: '' }), [field]: value },
    }));
  };

  const isBookingDisabled = (roomKey: string) => {
    const dates = roomDates[roomKey];
    return !dates || !dates.checkInDate || !dates.checkOutDate;
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="hotel-container">
      <div className="hotel-header">
        <div className="hotel-images">
          {hotel.images.map((image, index) => (
            <img key={`${hotel._id}-img-${index}`} src={image} alt="Hotel" />
          ))}
        </div>
        <div className="hotel-info">
          <h1>{hotel.title}</h1>
          <p>{hotel.description || 'Описание отсутствует'}</p>
        </div>
      </div>

      <div className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const rk = getRoomKey(room); // IMPORTANT
            return (
              <RoomCard
                key={rk}                // единственный key — здесь
                roomKey={rk}            // и используем его в логике
                room={room}
                dates={roomDates[rk]}
                onDateChange={handleDateChange}
                onBook={handleBooking}
                isDisabled={isBookingDisabled}
              />
            );
          })
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

export default HotelRoomsListClient;