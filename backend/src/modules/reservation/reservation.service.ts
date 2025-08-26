import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { ReservationDto } from './dto/reservation.dto';
import { ReservationSearchOptions } from './dto/reservation-search-options.dto';
import { ReservationSearchHotels, ReservationSearchHotel, ReservationSearchHotelsData } from './dto/reservation-search-hotels.dto';
import { ReservationUserSearchDto } from './dto/reservation-user-search.dto';


@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
  ) {}

async addReservation(data: ReservationDto): Promise<Reservation> {
    const { dateStart, dateEnd, ...rest } = data;
    
    const existingReservation = await this.reservationModel.findOne({
      roomId: rest.roomId,
      $or: [
        { dateStart: { $lt: new Date(dateEnd), $gte: new Date(dateStart) } },
        { dateEnd: { $gt: new Date(dateStart), $lte: new Date(dateEnd) } },
         // Полное перекрытие интервалов:
        { $and: [{ dateStart: { $lte: new Date(dateStart) } }, { dateEnd: { $gte: new Date(dateEnd) } }] },
      ],
    });

    if (existingReservation) {
      throw new NotFoundException('Room is already reserved for the selected dates.');
    }

    const newReservation = new this.reservationModel({
      ...rest,
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
    });

    return newReservation.save();
}

  async removeReservation(id: string): Promise<void> {
    await this.reservationModel.findByIdAndDelete(id);
  }

async getReservations(filter: ReservationSearchOptions): Promise<Reservation[]> {
  const query: any = {};
if (filter.userId) query.userId = filter.userId;
if (filter.dateStart) query.dateStart = { $gte: new Date(filter.dateStart) };
if (filter.dateEnd) query.dateEnd = { ...(query.dateEnd || {}), $lte: new Date(filter.dateEnd) };
return this.reservationModel
  .find(query)
  .populate('userId', 'name email contactPhone')
  .populate('hotelId')
  .populate('roomId')
  .exec();
}
async getReservationsByHotels(filter: ReservationSearchHotels): Promise<Reservation[]> {
const query: any = {};
if (filter.hotelId) query.hotelId = filter.hotelId;
if (filter.dateStart) query.dateStart = { $gte: new Date(filter.dateStart) };
if (filter.dateEnd) query.dateEnd = { ...(query.dateEnd || {}), $lte: new Date(filter.dateEnd) };

return this.reservationModel
  .find(query)
  .populate('userId', 'name email contactPhone')
  .populate('hotelId')
  .populate('roomId')
  .exec();
}
async getReservationsByHotel(filter: ReservationSearchHotel): Promise<Reservation[]> {
const query: any = {};
if (filter.hotelId) query.hotelId = filter.hotelId;

return this.reservationModel
  .find(query)
  .populate('userId', 'name email contactPhone')
  .populate('hotelId')
  .populate('roomId')
  .exec();
}
async getReservationsByHotelData(filter: ReservationSearchHotelsData): Promise<Reservation[]> {
const query: any = {};
if (filter.dateStart) query.dateStart = { $gte: new Date(filter.dateStart) };
if (filter.dateEnd) query.dateEnd = { ...(query.dateEnd || {}), $lte: new Date(filter.dateEnd) };

return this.reservationModel
  .find(query)
  .populate('userId', 'name email contactPhone')
  .populate('hotelId')
  .populate('roomId')
  .exec();
}
async getReservationsByUser(filter: ReservationUserSearchDto): Promise<Reservation[]> {
  const query: any = {};

  // Фильтрация по userId, hotelId, датам
  if (filter.userId) query.userId = filter.userId;
  if (filter.hotelId) query.hotelId = filter.hotelId;
  if (filter.dateStart) query.dateStart = { $gte: new Date(filter.dateStart) };
  if (filter.dateEnd) query.dateEnd = { $lte: new Date(filter.dateEnd) };

  const reservations = await this.reservationModel
    .find(query)
    .populate('userId', 'name email contactPhone') // Загружаем имя, email, телефон
    .populate('hotelId')
    .populate('roomId')
    .exec();

  if (!filter.name && !filter.email && !filter.contactPhone && !filter.q) {
    return reservations; // Возвращаем базовые результаты, если поля не указаны
  }

  // Применяем поля фильтрации
  const q = (filter.q || '').toLowerCase(); // Универсальный параметр q
  return reservations.filter((reservation: any) => {
    const user = reservation.userId || {}; // Проверяем данные пользователя

    const byName = filter.name
      ? (user.name || '').toLowerCase().includes(filter.name.toLowerCase())
      : true;

    const byEmail = filter.email
      ? (user.email || '').toLowerCase().includes(filter.email.toLowerCase())
      : true;

    const byPhone = filter.contactPhone
      ? (user.contactPhone || '').includes(filter.contactPhone)
      : true;

    const byQ = q
      ? ((user.name || '').toLowerCase().includes(q) ||
         (user.email || '').toLowerCase().includes(q) ||
         (user.contactPhone || '').toLowerCase().includes(q))
      : true;

    return byName && byEmail && byPhone && byQ; // Все условия должны быть выполнены
  });
}
}