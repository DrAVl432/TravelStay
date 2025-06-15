import { Controller, Post, Body, Delete, Get, Query, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationDto } from './dto/reservation.dto';
import { ReservationSearchOptions } from './dto/reservation-search-options.dto';

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
}