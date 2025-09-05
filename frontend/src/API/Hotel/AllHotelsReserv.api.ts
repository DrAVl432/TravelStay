export const HotelRezApi = {
// Забронированные номера: по названию отеля
fetchBookedByHotel: async (hotelId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/reservations/hotel?hotelId=${encodeURIComponent(hotelId)}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error('Failed to fetch booked hotels');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении забронированных номеров по отелю:', error);
    return [];
  }
},

// Забронированные номера: по отелю и датам
fetchBookedByHotelAndDates: async (hotelId: string, dateStart: string, dateEnd: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/reservations/hotels?hotelId=${encodeURIComponent(hotelId)}&dateStart=${encodeURIComponent(dateStart)}&dateEnd=${encodeURIComponent(dateEnd)}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error('Failed to fetch booked by hotel and dates');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении забронированных номеров по отелю и датам:', error);
    return [];
  }
},

// Забронированные: по датам
fetchBookedByDates: async (dateStart: string, dateEnd: string) => {
const response = await fetch(`http://localhost:3000/api/reservations/hotelsdata?dateStart=${encodeURIComponent(dateStart)}&dateEnd=${encodeURIComponent(dateEnd)}`, {
method: 'GET',
headers: { 'Content-Type': 'application/json' },
});
if (!response.ok) throw new Error('Failed to fetch booked by dates');
return await response.json();
},

// // Забронированные: все с текущей даты
// fetchBookedAllFromNow: async () => {
// const today = new Date().toISOString();
// const response = await fetch(`http://localhost:3000/api/reservations/hotelsdata?dateStart=${encodeURIComponent(today)}`, {
// method: 'GET',
// headers: { 'Content-Type': 'application/json' },
// });
// if (!response.ok) throw new Error('Failed to fetch booked from now');
// return await response.json();
// },


createReservation: async (reservationData: { roomId: string; userId: string; hotelId: string; dateStart: string; dateEnd: string; }) => {
  try {
    const response = await fetch(`http://localhost:3000/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка при создании резервации:', errorText);
      throw new Error('Ошибка при создании резервации');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании резервации:', error);
    return null;
  }
},


  // Забронированные: все без учета дат
  fetchBookedAll: async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/reservations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch all reservations');
      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении всех бронирований:', error);
      return [];
    }
  },
};

// Поиск броней по пользователю (имя/email/телефон/userId)
export const ReservationUserApi = {
fetchByUser: async (params: { userId?: string; name?: string; email?: string; contactPhone?: string; q?: string; hotelId?: string; dateStart?: string; dateEnd?: string; }) => {
const qs = new URLSearchParams();
Object.entries(params).forEach(([k, v]) => {
if (v) qs.append(k, String(v));
});
try {
const response = await fetch(`http://localhost:3000/api/reservations/by-user?${qs.toString()}`, {
method: 'GET',
headers: { 'Content-Type': 'application/json' },
});
if (!response.ok) throw new Error('Failed to fetch reservations by user');
return await response.json();
} catch (error) {
console.error('Ошибка при поиске брони по пользователю:', error);
return [];
}
},
};

export const RoomDelApi = {
fetchHotelRoomDel: async (Id: string) => {
const response = await fetch(`http://localhost:3000/api/reservations/${Id}`, {
method: 'DELETE',
headers: { 'Content-Type': 'application/json' },
});
if (!response.ok) {
  throw new Error(`Failed to delete room reservation: ${response.status} ${response.statusText}`);
}

// Если 204 No Content — вернем null
if (response.status === 204) {
  return null;
}

// Если есть тело и оно не пустое — распарсим
const text = await response.text();
if (!text) {
  return null;
}
try {
  return JSON.parse(text);
} catch {
  // Невалидный JSON — вернем как текст или null, чтобы не падать
  return null;
}
},
};

