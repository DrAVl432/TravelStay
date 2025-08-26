import React, { useState } from 'react';
import { toISODateInput } from '../utils/date-utils';
import { ReservationUserApi, HotelRezApi, RoomDelApi } from '../API/Hotel/AllHotelsReserv.api';
import { AllHotelsApi } from '../API/Hotel/AllHotels.api';

const SearchHotelsManager: React.FC = () => {
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [hotelName, setHotelName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [searchHeader, setSearchHeader] = useState<string>('');

  // Разрешаем hotelId по названию через AllHotelsApi.getAllHotels()
  const resolveHotelId = async (): Promise<string | null> => {
    if (!hotelName) return null;
    try {
      const hotels = await AllHotelsApi.getAllHotels();
      const found = Array.isArray(hotels)
        ? hotels.find((h: any) => (h?.title || '').trim().toLowerCase() === hotelName.trim().toLowerCase())
        : null;
      return found?._id || null;
    } catch (error) {
      console.error('Ошибка при поиске гостиницы:', error);
      alert('Не удалось получить список гостиниц. Повторите позже.');
      return null;
    }
  };

  const handleSearch = async () => {
    try {
      const resolvedHotelId = await resolveHotelId();
      if (hotelName && !resolvedHotelId) {
        alert('Гостиница не найдена. Уточните название.');
        return;
      }

      const ds = dateStart ? toISODateInput(dateStart) : '';
      const de = dateEnd ? toISODateInput(dateEnd) : '';

      const hasUserFilters = !!(name || email || contactPhone || userId);
      if (hasUserFilters) {
        const reservations = await ReservationUserApi.fetchByUser({
          userId: userId || undefined,
          name: name || undefined,
          email: email || undefined,
          contactPhone: contactPhone || undefined,
          hotelId: resolvedHotelId || undefined,
          dateStart: ds || undefined,
          dateEnd: de || undefined,
        });
        setResults(Array.isArray(reservations) ? reservations : []);
        setSearchHeader(`Результаты бронирований за период: ${dateStart || 'не указана'} - ${dateEnd || 'не указана'}`);
        clearFields();
        return;
      }

      // Поиск только забронированных
      if (resolvedHotelId && ds && de) {
        const reservations = await HotelRezApi.fetchBookedByHotelAndDates(resolvedHotelId, ds, de);
        setResults(Array.isArray(reservations) ? reservations : []);
        setSearchHeader(`Результаты бронирований: ${dateStart || 'не указана'} - ${dateEnd || 'не указана'}`);
        clearFields();
        return;
      }

      if (resolvedHotelId && !ds && !de) {
        const reservations = await HotelRezApi.fetchBookedByHotel(resolvedHotelId);
        setResults(Array.isArray(reservations) ? reservations : []);
        setSearchHeader(`Результаты бронирований по отелю "${hotelName}"`);
        clearFields();
        return;
      }

      if (ds && de) {
        const reservations = await HotelRezApi.fetchBookedByDates(ds, de);
        setResults(Array.isArray(reservations) ? reservations : []);
        setSearchHeader(`Результаты бронирований: ${dateStart} - ${dateEnd}`);
        clearFields();
        return;
      }

// Если ничего не задано — покажем все брони без учета дат
const reservations = await HotelRezApi.fetchBookedAll();
setResults(Array.isArray(reservations) ? reservations : []);
setSearchHeader('Все брони (без учета дат)');
clearFields();
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      alert('Произошла ошибка. Повторите позже.');
    }
  };

  const clearFields = () => {
    setDateStart('');
    setDateEnd('');
    setHotelName('');
    setUserId('');
    setName('');
    setEmail('');
    setContactPhone('');
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await RoomDelApi.fetchHotelRoomDel(id);
      setResults((prev) => prev.filter((reservation) => reservation._id !== id));
      alert('Бронь успешно аннулирована.');
    } catch (error) {
      console.error('Ошибка при аннулировании брони:', error);
      alert('Не удалось аннулировать бронь.');
    }
  };

  // Безопасные геттеры для вложенных объектов
  const getHotelTitle = (reservation: any) => {
    const h = reservation?.hotelId;
    return h?.title || h?.name || h || '-';
  };
  const getRoomDescription = (reservation: any) => {
    const r = reservation?.roomId;
    return r?.description || r?.name || r || '-';
  };
  const getUserName = (reservation: any) => {
    const u = reservation?.userId;
    return u?.name || '-';
  };
  const getUserEmail = (reservation: any) => {
    const u = reservation?.userId;
    return u?.email || '-';
  };
  const getUserPhone = (reservation: any) => {
    const u = reservation?.userId;
    return u?.contactPhone || reservation?.contactPhone || '-';
  };

  const renderBookedTable = () => (
    <table>
      <thead>
        <tr>
          <th>Гостиница</th>
          <th>Описание номера</th>
          <th>Дата заезда</th>
          <th>Дата выезда</th>
          <th>Имя пользователя</th>
          <th>Номер телефона</th>
          <th>Электронная почта</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {results.map((reservation) => (
          <tr key={reservation._id}>
            <td>{getHotelTitle(reservation)}</td>
            <td>{getRoomDescription(reservation)}</td>
            <td>{reservation.dateStart ? new Date(reservation.dateStart).toLocaleDateString() : '-'}</td>
            <td>{reservation.dateEnd ? new Date(reservation.dateEnd).toLocaleDateString() : '-'}</td>
            <td>{getUserName(reservation)}</td>
            <td>{getUserPhone(reservation)}</td>
            <td>{getUserEmail(reservation)}</td>
            <td>
              <button onClick={() => handleDeleteReservation(reservation._id)}>Аннулировать</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <h1>Поиск бронирований гостиницы</h1>
      <div>
        <label htmlFor="hotelName">Название гостиницы:</label>
        <input type="text" id="hotelName" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="dateStart">Дата начала:</label>
        <input type="date" id="dateStart" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
      </div>
      <div>
        <label htmlFor="dateEnd">Дата окончания:</label>
        <input type="date" id="dateEnd" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
      </div>
      <div>
        <label htmlFor="userId">ID пользователя:</label>
        <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div>
        <label htmlFor="name">Имя пользователя:</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="contactPhone">Телефон:</label>
        <input type="text" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </div>

      <button onClick={handleSearch}>Поиск</button>

      {results.length > 0 && (
        <div>
          <h2>{searchHeader}</h2>
          {renderBookedTable()}
        </div>
      )}
    </div>
  );
};

export default SearchHotelsManager;