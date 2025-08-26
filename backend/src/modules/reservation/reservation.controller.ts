import { Controller, Post, Body, Delete, Get, Query, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationDto } from './dto/reservation.dto';
import { ReservationSearchOptions } from './dto/reservation-search-options.dto';
import { ReservationSearchHotels, ReservationSearchHotel, ReservationSearchHotelsData } from './dto/reservation-search-hotels.dto';
import { ReservationUserSearchDto } from './dto/reservation-user-search.dto';

@Controller('reservations')
export class ReservationController {
constructor(private readonly reservationService: ReservationService) {}

@Post()
async create(@Body() reservationDto: ReservationDto) {
return this.reservationService.addReservation(reservationDto);
}

@Delete(':id')
async remove(@Param('id') id: string) {
return this.reservationService.removeReservation(id);
}

@Get()
async findAll(@Query() filter: ReservationSearchOptions) {
return this.reservationService.getReservations(filter);
}

@Get('hotels')
async findAllHotels(@Query() filter: ReservationSearchHotels) {
return this.reservationService.getReservationsByHotels(filter);
}

@Get('hotel')
async findAHotel(@Query() filter: ReservationSearchHotel) {
return this.reservationService.getReservationsByHotel(filter);
}

@Get('hotelsdata')
async findAllHotelsData(@Query() filter: ReservationSearchHotelsData) {
return this.reservationService.getReservationsByHotelData(filter);
}

@Get('by-user')
async findByUser(@Query() filter: ReservationUserSearchDto) {
return this.reservationService.getReservationsByUser(filter);
}
}