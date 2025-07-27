import { Controller, Get, Post, Body, Query, Param, UploadedFile, UseInterceptors, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HotelRoomService } from './hotel-room.service';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { SearchRoomsParams } from './dto/search-hotel-room-params.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';

@Controller('hotel-rooms')
export class HotelRoomController {
  constructor(private readonly hotelRoomService: HotelRoomService) {}

  @Post()
  @UseInterceptors(FileInterceptor('images')) // Добавлено для загрузки изображения
  async create(@Body() createHotelRoomDto: CreateHotelRoomDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createHotelRoomDto.images = file.path; // Сохранение пути к загруженному файлу
    }
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

  @Get('by-hotel/:hotelId')
  async findRoomsByHotel(@Param('hotelId') hotelId: string, @Query('limit') limit?: number, @Query('offset') offset?: number, @Query('isEnabled') isEnabled?: boolean) {
    const params: SearchRoomsParams = { hotel: hotelId, limit, offset, isEnabled };
    return await this.hotelRoomService.search(params);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateHotelRoomDto: UpdateHotelRoomDto) {
    const updatedRoom = await this.hotelRoomService.update(id, updateHotelRoomDto);
    return updatedRoom;
  }
}