import React, { useEffect, useState, useMemo  } from 'react';
import { Hotel } from '../types/Hotel.types';
import { HotelRoomsApi } from '../API/Hotel/HotelRooms.api';
import HotelForm from './HotelForm';
import RoomForm from './RoomForm';
import { HotelApi } from '../API/Hotel/Hotel.api';
import '../styles.css';

interface HotelRoom {
  id: string;
  title?: string;
  description?: string;
  images: string[];
  isEnabled: boolean;
  // hotelId?: string;
}

interface HotelRoomsListProps {
  hotel: Hotel;
  onClose: () => void;
}

const HotelRoomsListAdmin: React.FC<HotelRoomsListProps> = ({ hotel, onClose }) => {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isHotelFormOpen, setIsHotelFormOpen] = useState<boolean>(false);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState<boolean>(false);
  const [roomBeingEdited, setRoomBeingEdited] = useState<HotelRoom | null>(null);

  const [hotelData, setHotelData] = useState<Hotel>(hotel);

  const requestId = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const safeId = hotelData?._id || hotel?._id;

  const log = (...args: any[]) => {
    console.log('[HRLA]', `rid=${requestId}`, ...args);
  };

  const fetchRooms = async (reason: string) => {
    log('fetchRooms:start', { reason, hotelId: safeId });
    setLoading(true);
    try {
const fetchedRooms = await HotelRoomsApi.getRoomsByHotel(safeId);
  const normalized = (fetchedRooms || []).map((r: any) => ({
    id: r.id ?? r._id,       // взять id, если есть, иначе _id
    title: r.title,
    description: r.description,
    images: r.images || [],
    isEnabled: r.isEnabled ?? true,
    // hotelId: r.hotelId ?? r.hotel?._id,
  }));
  setRooms(normalized);
    } catch (error) {
      log('fetchRooms:error', error);
      setError('Не удалось получить номера отеля');
    } finally {
      setLoading(false);
      log('fetchRooms:finish');
    }
  };

  useEffect(() => {
    log('mount:useEffect -> initial fetchRooms', { hotelData });
    fetchRooms('mount/useEffect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelData?._id]);

  const handleEditHotel = () => {
    log('handleEditHotel:openModal', { hotelId: safeId });
    setIsHotelFormOpen(true);
  };

  const handleCloseHotelForm = async () => {
    log('handleCloseHotelForm:start', { hotelId: safeId });
    setIsHotelFormOpen(false);
    try {
      log('handleCloseHotelForm:fetchUpdatedHotel:start');
      const updatedHotel = await HotelApi.getHotelById(safeId);
      log('handleCloseHotelForm:fetchUpdatedHotel:success', { title: updatedHotel?.title, images: updatedHotel?.images?.length });
      setHotelData(updatedHotel);
      await fetchRooms('handleCloseHotelForm');
    } catch (err) {
      log('handleCloseHotelForm:error', err);
      console.error('Ошибка обновления данных гостиницы при закрытии формы:', err);
    } finally {
      log('handleCloseHotelForm:finish');
    }
  };

  const handleHotelUpdate = async () => {
    log('handleHotelUpdate:start', { hotelId: safeId });
    try {
      const updatedHotel = await HotelApi.getHotelById(safeId);
      log('handleHotelUpdate:success', { title: updatedHotel?.title, images: updatedHotel?.images?.length });
      setHotelData(updatedHotel);
      await fetchRooms('handleHotelUpdate');
    } catch (err) {
      log('handleHotelUpdate:error', err);
      console.error('Ошибка обновления гостиницы:', err);
    } finally {
      log('handleHotelUpdate:finish');
    }
  };

  const handleBack = async () => {
    log('back:click:start');
    try {
      await onClose();
      log('back:click:done');
    } catch (err) {
      log('back:click:error', err);
    }
  };

  // --- Room form handlers ---

  const openCreateRoomModal = () => {
    log('handleAddRoom:click', { hotelId: safeId });
    setRoomBeingEdited(null);
    setIsRoomFormOpen(true);
  };

  const openEditRoomModal = (room: HotelRoom) => {
    log('editRoom:click', { roomId: room.id });
    setRoomBeingEdited(room);
    setIsRoomFormOpen(true);
  };

  const closeRoomForm = () => {
    log('roomForm:close');
    setIsRoomFormOpen(false);
    setRoomBeingEdited(null);
  };

  const afterRoomSaved = async () => {
    log('roomForm:afterSaved:start');
    await fetchRooms('afterRoomSaved');
    log('roomForm:afterSaved:done');
  };

  // отображаем hotelData
  const renderHotel = hotelData || hotel;

  if (loading) {
    log('render:loading');
    return <p>Загрузка...</p>;
  }

  if (error) {
    log('render:error', { error });
    return <p>{error}</p>;
  }

  log('render:ready', {
    hotelId: renderHotel?._id,
    title: renderHotel?.title,
    images: renderHotel?.images?.length,
    rooms: rooms?.length
  });

  return (
    <div className="hotel-container">
      <button className="back-button" onClick={handleBack}>
        Назад
      </button>

      <div className="hotel-header">
        <div className="hotel-images">
          {(renderHotel?.images || []).map((image: string, index: number) => (
            <img key={index} src={image} alt="Hotel" />
          ))}
        </div>
        <div className="hotel-info">
          <h1>{renderHotel?.title}</h1>
          <p>{renderHotel?.description || 'Описание отсутствует'}</p>
          <div className="hotel-buttons">
            <button onClick={handleEditHotel}>Редактировать</button>
            <button onClick={openCreateRoomModal}>Добавить номер</button>
          </div>
        </div>
      </div>

      <div className="room-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-image">
                <img
                  src={room.images?.[0] || 'https://via.placeholder.com/150'}
                  alt={`Room ${room.id}`}
                />
              </div>
              <div className="room-info">
                <h2>{room.title || 'Описание отсутствует'}</h2>
                <h2>{room.description || 'Описание отсутствует'}</h2>
                <button onClick={() => openEditRoomModal(room)}>Редактировать номер</button>
              </div>
            </div>
          ))
        ) : (
          <p>Нет доступных номеров.</p>
        )}
      </div>

      {isHotelFormOpen && (
        <div className="modal">
           <HotelForm
            hotel={renderHotel}
            onClose={handleCloseHotelForm}
            onUpdate={handleHotelUpdate}
          />
        </div>
      )}

      {isRoomFormOpen && (
        <div className="modal">
          <RoomForm
            hotel={renderHotel}
            existingRoom={
              roomBeingEdited
                ? {
                    id: roomBeingEdited.id,
                    hotel: renderHotel,
                    title: roomBeingEdited.title || '',
                    description: roomBeingEdited.description,
                    images: roomBeingEdited.images || [],
                    isEnabled: roomBeingEdited.isEnabled,
                  }
                : undefined
            }
            onClose={closeRoomForm}
            onSaved={afterRoomSaved}
          />
        </div>
      )}
    </div>
  );
};

export default HotelRoomsListAdmin;