import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schemas/hotel.schema';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelRoomController } from './hotel-room.controller'; // Добавление контроллера
import { HotelRoomService } from './hotel-room.service'; // Добавление сервиса
import { HotelRoom, HotelRoomSchema } from './schemas/hotel-room.schema'; // Добавление схемы HotelRoom

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  providers: [HotelService, HotelRoomService], // Добавление сервиса HotelRoomService
  controllers: [HotelController, HotelRoomController], // Добавление контроллера HotelRoomController
  exports: [HotelService, HotelRoomService], // Экспортируемый сервис
})
export class HotelModule {}