import React, { useEffect, useState } from 'react';
import { AllHotelsApi } from '../API/AllHotels.api';
import HotelRoomsList from './HotelRoomsList';
import '../styles.css';

interface Hotel {
    _id: string; 
    title: string;
    description?: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const HotelsList: React.FC = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
    const hotelsPerPage = 10;

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const fetchedHotels = await AllHotelsApi.getAllHotels();
                console.log("Полученные отели:", fetchedHotels);
                setHotels(fetchedHotels);
            } catch (error) {
                console.error('Ошибка при получении отелей:', error);
            }
        };
        fetchHotels();
    }, []);

    const indexOfLastHotel = currentPage * hotelsPerPage;
    const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
    const currentHotels = hotels.slice(indexOfFirstHotel, indexOfLastHotel);
    
    const handlePageChange = (page: number) => setCurrentPage(page);
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handleRoomList = (hotelId: string) => {
         
        if (hotelId) {
        console.log("Кнопка нажата, Hotel ID:", hotelId);
        setSelectedHotelId(hotelId);
        console.log("Текущее состояние selectedHotelId:", hotelId);
         } else {
        console.error("Некорректный ID отеля");
    }
    };

    const handleCloseRoomList = () => {
        setSelectedHotelId(null);
        console.log("Закрытие списка комнат, selectedHotelId сброшен");
    };

    return (
        <div id="container">
            <div id="main">
                {selectedHotelId ? (
                    <HotelRoomsList hotelId={selectedHotelId} onClose={handleCloseRoomList} />
                ) : (
                    currentHotels.length > 0 ? (
                        currentHotels.map(hotel => (
                            <div key={hotel._id} className="hotel-card">
                                <img src={hotel.images[0]} alt={hotel.title} />
                                <h3>{hotel.title}</h3>
                                <p>{hotel.description}</p>
                                <button onClick={() => handleRoomList(hotel._id)}>Подробнее</button>
                            </div>
                        ))
                    ) : (
                        <img src='default_image.jpg' alt="Нет доступных отелей" />
                    )
                )}
            </div>
            {hotels.length > hotelsPerPage && (
                <div className="pagination">
                    {[...Array(Math.ceil(hotels.length / hotelsPerPage)).keys()].map(num => (
                        <button 
                            key={num} 
                            onClick={() => handlePageChange(num + 1)} 
                            className={currentPage === num + 1 ? 'active' : ''}
                        >
                            {num + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HotelsList;