import React, { useEffect, useState } from 'react';
import { Hotel } from '../types/Hotel.types';
import { AllHotelsApi } from '../API/Hotel/AllHotels.api';
import HotelRoomsList from './HotelRoomsList';
import HotelRoomsListClient from './HotelRoomsListClient';
import HotelRoomsListAdmin from './HotelRoomsListAdmin';
import HotelForm from './HotelForm'; // Импортируем форму
import '../styles.css';
import useAuth from '../hooks/useAuth';

const HotelsList: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [componentToRender, setComponentToRender] = useState<React.ReactElement | null>(null); // Новый стейт для компонента
  const [isHotelFormOpen, setIsHotelFormOpen] = useState<boolean>(false); // Состояние для формы
  const { userRole } = useAuth();
  const hotelsPerPage = 10;

    const fetchHotels = async () => {
      try {
        const fetchedHotels = await AllHotelsApi.getAllHotels();
        setHotels(fetchedHotels);
      } catch (error) {
        console.error('Ошибка при получении отелей:', error);
      }
    };
 useEffect(() => {
    fetchHotels();
  }, []);

    const handleHotelFormClose = async () => {
    await fetchHotels(); // Обновление списка при закрытии формы
    setIsHotelFormOpen(false);
  };

  const handleHotelRoomsClose = async () => {
    await fetchHotels(); // Обновление списка при закрытии админ-компонента
    setComponentToRender(null); // Закрываем компонент
  };

  const currentHotels = hotels
    .filter((hotel) => hotel.title.toLowerCase().includes(searchQuery.toLowerCase())) // Фильтрация по названию
    .slice((currentPage - 1) * hotelsPerPage, currentPage * hotelsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleAddHotel = () => {
    setIsHotelFormOpen(true); // Открыть форму
  };

  const closeHotelForm = () => {
    setIsHotelFormOpen(false); // Закрыть форму
  };

  const openHotelRooms = (hotel: Hotel) => {
    setSelectedHotel(hotel);

    // Логика выбора компонента в зависимости от роли пользователя
    if (userRole === 'admin') {
      setComponentToRender(<HotelRoomsListAdmin hotel={hotel} onClose={closeHotelRooms} />);
    } else if (userRole === 'client') {
      setComponentToRender(<HotelRoomsListClient hotel={hotel} onClose={closeHotelRooms} />);
    } else {
      setComponentToRender(<HotelRoomsList hotel={hotel} onClose={closeHotelRooms} />);
}
 };
  const closeHotelRooms = () => {
    setSelectedHotel(null);
    setComponentToRender(null); // Сбрасываем компонент
  };

  if (componentToRender) {
    return componentToRender; // Рендерим выбранный компонент
  }




  return (
    <div id="container">
      <div id="header">
        <input
          type="text"
          placeholder="Введите название гостиницы..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {userRole === 'admin' && (
          <button onClick={handleAddHotel} style={{ marginLeft: '10px' }}>
            Добавить гостиницу
          </button>
        )}
      </div>
      <div id="main">
        {currentHotels.map((hotel) => (
          <div key={hotel._id} className="hotel-card">
            <img src={hotel.images[0]} alt={hotel.title} />
            <h3>{hotel.title}</h3>
            <p>{hotel.description}</p>
 {userRole === 'admin' ? (
              <button onClick={() => openHotelRooms(hotel)}>Редактировать</button>
            ) : (
              <button onClick={() => openHotelRooms(hotel)}>Подробнее</button>
            )}
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({ length: Math.ceil(hotels.length / hotelsPerPage) }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* Форма для добавления гостиницы */}
       {isHotelFormOpen && (
        <HotelForm
          onClose={handleHotelFormClose} // Передаем обновление вместе с закрытием
          onUpdate={fetchHotels} // Обновление списка после сохранения
        />
      )}
      {selectedHotel && (
        <HotelRoomsListAdmin
          hotel={selectedHotel}
          onClose={handleHotelRoomsClose} // Передаем обновление вместе с закрытием
        />
      )}
    </div>
  );
};

export default HotelsList;