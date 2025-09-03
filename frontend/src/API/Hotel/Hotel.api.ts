import { CreateHotelDto } from '../../../../backend/src/modules/hotel/dto/create-hotel.dto';
import { UpdateHotelDto } from '../../../../backend/src/modules/hotel/dto/update-hotel.dto';
export const HotelApi = {
    // Получение отеля по ID
    getHotelById: async (hotelId: string) => {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch hotel with ID ${hotelId}`);
        }

        return await response.json();
    },

    // Создание нового отеля
    createHotel: async (createHotelDto: CreateHotelDto) => {
        const response = await fetch('http://localhost:3000/api/hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
             body: JSON.stringify(createHotelDto),
        });

        if (!response.ok) {
            throw new Error('Failed to create hotel');
        }

        return await response.json();
    },

    // Обновление отеля по ID
    updateHotel: async (hotelId: string, updateHotelDto: UpdateHotelDto) => {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateHotelDto),
        });

        if (!response.ok) {
            throw new Error(`Failed to update hotel with ID ${hotelId}`);
        }

        return await response.json();
    },
};