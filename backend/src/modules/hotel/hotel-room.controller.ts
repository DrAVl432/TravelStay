import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { HotelRoomService } from './hotel-room.service';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
//import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { SearchRoomsParams } from './dto/search-hotel-room-params.dto';

@Controller('hotel-rooms')
export class HotelRoomController {
  constructor(private readonly hotelRoomService: HotelRoomService) {}

  @Post()
  async create(@Body() createHotelRoomDto: CreateHotelRoomDto) {
    return this.hotelRoomService.create(createHotelRoomDto);
  }

  @Get()
  async findAll(@Query() params: SearchRoomsParams) {
    return this.hotelRoomService.search(params);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.hotelRoomService.findById(id);
  }
}