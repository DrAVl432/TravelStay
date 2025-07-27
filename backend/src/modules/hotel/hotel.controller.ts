import { Controller, Get, Post, Body, Put, Query, Param } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { SearchHotelParams } from './dto/search-hotel-params.dto';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  async create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

 @Get()
async findAll(@Query() params: SearchHotelParams) {
    console.log("Запрос параметров:", params);
    const hotels = await this.hotelService.search(params);
    console.log("Найденные гостиницы:", hotels);
    return hotels;
}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.hotelService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    const updatedHotel = await this.hotelService.update(id, updateHotelDto);
    return updatedHotel;
  }
}