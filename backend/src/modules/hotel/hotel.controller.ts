import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
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
    return this.hotelService.search(params);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.hotelService.findById(id);
  }
}