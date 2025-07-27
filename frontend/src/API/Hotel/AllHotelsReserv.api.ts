export const HotelsDataApi = {
    fetchAvailableHotels: async (dateStart: string, dateEnd: string) => {
        // ... существующий код
    },
    fetchAvailableHotelsByName: async (hotelId: string) => {
        // Поиск свободных гостиниц по имени
        try {
            const response = await fetch(`http://localhost:3000/api/hotels?hotelId=${hotelId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении данных гостиниц:', error);
            return [];
        }
    },
    fetchFreeHotels: async (dateStart: string, dateEnd: string) => {
        // Поиск свободных гостиниц по датам
                try {
            const response = await fetch(`http://localhost:3000/api/reservations/hotelsdata?dateStart=${dateStart}&dateEnd=${dateEnd}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении данных гостиниц:', error);
            return [];
        }
    },
    fetchFreeHotelsByNameAndDates: async (hotelId: string, dateStart: string, dateEnd: string) => {
        // Поиск свободных гостиниц по имени и датам
                    try {
            const response = await fetch(`http://localhost:3000/api/reservations/hotels?hotelId=${hotelId}&dateStart=${dateStart}&dateEnd=${dateEnd}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении данных гостиниц:', error);
            return [];
        }
    },
};

export const HotelRezApi = {
    fetchAvailableHotel: async (hotelId: string) => {
        // Поиск забронированных номеров по имени гостиницы
        const response = await fetch(`http://localhost:3000/api/reservations/hotel?hotelId=${hotelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        return await response.json();
    },
  
    // Новый метод для создания резервации
    createReservation: async (reservationData: { roomId: string; userId: string; dateStart: string; dateEnd: string; }) => {
        try {
            const response = await fetch(`http://localhost:3000/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании резервации');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании резервации:', error);
            return null;
        }
    },

    fetchAvailableHotelByNameAndDates: async (hotelId: string, dateStart: string, dateEnd: string) => {
        // Поиск забронированных номеров по имени гостиницы и датам
        // аналогично предыдущему методу
    },
};

export const RoomDelApi = {
    fetchHotelRoomDel: async (roomId: string) => { // Добавил roomId как параметр
        const response = await fetch(`http://localhost:3000/api/reservations/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete room reservation');
        }

        return await response.json();
    },
};

export const RoomSearchApi = {
    fetchHotelRoomSearch: async (roomId: string) => { // Добавил roomId как параметр
        const response = await fetch(`http://localhost:3000/api/hotel-rooms/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch room');
        }
        return await response.json();
    },
  
};