export interface ReservationWithDetails {
   roomId: string;
//   userId: User; // ID пользователя, на имя которого сделана бронь
  hotel: {
    title: string;
  };
  room: {
    description: string;
  };     // Имя номера
  dateStart: string;  // Дата заезда
  dateEnd: string; // Дата выезда
  user: {   
  name: string;   // Имя пользователя, осуществившего бронирование
  contactPhone: string;  // Номер телефона пользователя
  email: string;  // Электронная почта пользователя
  };
}