export const AllHotelsApi = {
    getAllHotels: async () => {
        const response = await fetch('http://localhost:3000/api/hotels', {
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