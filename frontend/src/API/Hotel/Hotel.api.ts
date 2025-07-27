export const HotelApi = {
    getAllHotels: async () => {
        const response = await fetch('http://localhost:3000/api/hotels?hotelId=${hotelId}', {
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
};