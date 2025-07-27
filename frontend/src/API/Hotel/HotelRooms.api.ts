export const HotelRoomsApi = {
    getRoomsByHotel: async (hotelId: string) => {
        const response = await fetch(`http://localhost:3000/api/hotel-rooms/by-hotel/${hotelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hotel rooms');
        }

        return await response.json();
    },
};

