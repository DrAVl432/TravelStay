const fetchAvailableHotels = async (dateStart: string, dateEnd: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/reservations/hotels?dateStart=${dateStart}&dateEnd=${dateEnd}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении данных гостиниц:', error);
        return [];
    }
};

export default {
    fetchAvailableHotels,
};