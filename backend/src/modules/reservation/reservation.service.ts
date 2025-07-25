import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { ReservationDto } from './dto/reservation.dto';
import { ReservationSearchOptions } from './dto/reservation-search-options.dto';
import { ReservationSearchHotels, ReservationSearchHotel, ReservationSearchHotelsData } from './dto/reservation-search-hotels.dto';

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
    return this.reservationModel.find({
      userId: filter.userId,
      dateStart: { $gte: new Date(filter.dateStart) },
      dateEnd: { $lte: new Date(filter.dateEnd) },
    }).exec();
  }
  async getReservationsByHotels(filter: ReservationSearchHotels): Promise<Reservation[]> {
    return this.reservationModel.find({
     hotelId: filter.hotelId,
     dateStart: { $gte: new Date(filter.dateStart) },
      dateEnd: { $lte: new Date(filter.dateEnd) },
    }).exec();
  }
    async getReservationsByHotel(filter: ReservationSearchHotel): Promise<Reservation[]> {
    return this.reservationModel.find({
     hotelId: filter.hotelId,
    
    }).exec();
  }
    async getReservationsByHotelData(filter: ReservationSearchHotelsData): Promise<Reservation[]> {
    return this.reservationModel.find({
      dateStart: { $gte: new Date(filter.dateStart) },
      dateEnd: { $lte: new Date(filter.dateEnd) },
    }).exec();
  }
}