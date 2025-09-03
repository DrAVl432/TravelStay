import React, { useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { ReservationUserApi } from '../API/Hotel/AllHotelsReserv.api';

type Reservation = {
  id: string;
  hotelId?: any; // Для корректного доступа к данным о гостинице
  roomId?: any;  // Для корректного доступа к данным о номерах
  userId?: any;  // Пользователь, связанный с бронью (если потребуется)
  checkIn?: string;   // ISO-дата
  checkOut?: string;  // ISO-дата
  dateStart?: string; // Альтернативное поле для даты заезда
  dateEnd?: string;   // Альтернативное поле для даты выезда
  contactPhone?: string; // Номер телефона пользователя
  email?: string;         // Электронная почта пользователя
};

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id; //user?._id || 

  const [useDateFilter, setUseDateFilter] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headerText = useMemo(() => {
    if (!useDateFilter || (!dateStart && !dateEnd)) {
      return 'Брони за период: все';
    }
    if (dateStart && dateEnd) return `Брони за период: ${dateStart} — ${dateEnd}`;
    if (dateStart) return `Брони за период: с ${dateStart}`;
    return `Брони за период: до ${dateEnd}`;
  }, [useDateFilter, dateStart, dateEnd]);

  // Функции-геттеры для извлечения данных
  const getHotelTitle = (reservation: Reservation) => {
    const h = reservation?.hotelId;
    return h?.title || h?.name || h || '-';
  };

  const getRoomDescription = (reservation: Reservation) => {
    const r = reservation?.roomId;
    return r?.description || r?.name || r || '-';
  };

  const getUserPhone = (reservation: Reservation) => {
    const u = reservation?.userId;
    return u?.contactPhone || reservation?.contactPhone || '-';
  };

  const getUserEmail = (reservation: Reservation) => {
    const u = reservation?.userId;
    return u?.email || reservation?.email || '-';
  };

  const handleSearch = async () => {
    if (!currentUserId) {
      setError('Не удалось определить текущего пользователя.');
      return;
    }
    if (useDateFilter && dateStart && dateEnd) {
      if (new Date(dateStart) > new Date(dateEnd)) {
        setError('Дата заезда не может быть позже даты выезда.');
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      const params: { userId: string; dateStart?: string; dateEnd?: string } = { userId: String(currentUserId) };
      if (useDateFilter) {
        if (dateStart) params.dateStart = dateStart;
        if (dateEnd) params.dateEnd = dateEnd;
      }

      const data: Reservation[] = await ReservationUserApi.fetchByUser(params);
      const mappedResults = data.map((r) => ({
        ...r,
        checkIn: r.checkIn || r.dateStart || '',
        checkOut: r.checkOut || r.dateEnd || '',
      }));
      setResults(mappedResults);

          setDateStart('');
    setDateEnd('');
    } catch (e: any) {
      setError(e?.message || 'Ошибка при загрузке броней.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (loading) return <div>Загрузка…</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!results.length) return <div>Нет броней по текущим критериям.</div>;

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Гостиница</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Описание номера</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Дата заезда</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Дата выезда</th>
            {/* <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Номер телефона</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Электронная почта</th> */}
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{getHotelTitle(r)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{getRoomDescription(r)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {r.checkIn ? new Date(r.checkIn).toLocaleDateString() : '-'}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {r.checkOut ? new Date(r.checkOut).toLocaleDateString() : '-'}
              </td>
              {/* <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{getUserPhone(r)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{getUserEmail(r)}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!currentUserId) {
    return <div>Не авторизован</div>;
  }

  return (
    <div>
      <h1>{headerText}</h1>
      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="checkbox"
            checked={useDateFilter}
            onChange={(e) => setUseDateFilter(e.target.checked)}
          />
          {' '}Фильтр по датам
        </label>
      </div>
      <div>
        <label htmlFor="dateStart">Дата заезда:</label>
        <input
          type="date"
          id="dateStart"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          disabled={!useDateFilter}
        />
      </div>
      <div>
        <label htmlFor="dateEnd">Дата выезда:</label>
        <input
          type="date"
          id="dateEnd"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          disabled={!useDateFilter}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSearch}>Искать</button>
      </div>
      <div style={{ marginTop: 20 }}>
        {renderTable()}
      </div>
    </div>
  );
};

export default MyReservations;