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

    createRoom: async (roomData: any) => {
        const response = await fetch(`http://localhost:3000/api/hotel-rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData),
        });

        if (!response.ok) {
            throw new Error('Failed to create hotel room');
        }

        return await response.json();
    },

    updateRoom: async (id: string, roomData: any) => {
        const response = await fetch(`http://localhost:3000/api/hotel-rooms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData),
        });

        if (!response.ok) {
            throw new Error('Failed to update hotel room');
        }

        return await response.json();
    },
};

export const RoomSearchApi = {
fetchHotelRoomSearch: async (roomId: string) => {
const response = await fetch(`http://localhost:3000/api/hotel-rooms/${encodeURIComponent(roomId)}`, {
method: 'GET',
headers: { 'Content-Type': 'application/json' },
});
if (!response.ok) throw new Error('Failed to fetch room');
return await response.json();
},
};