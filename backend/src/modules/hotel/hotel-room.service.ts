import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelRoom, HotelRoomDocument } from './schemas/hotel-room.schema';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { SearchRoomsParams } from './dto/search-hotel-room-params.dto';
import { Hotel } from './schemas/hotel.schema';

@Injectable()
export class HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name) private hotelRoomModel: Model<HotelRoom>,
    @InjectModel(Hotel.name) private hotelModel: Model<Hotel>,
  ) {}

  async create(data: CreateHotelRoomDto): Promise<HotelRoom> {
    const hotelExists = await this.hotelModel.findById(data.hotel);
    if (!hotelExists) {
      throw new NotFoundException('Hotel not found');
    }

    const room = new this.hotelRoomModel({ ...data, images: data.images });
    return room.save();
  }

  async findById(id: string): Promise<HotelRoom | null> {
    return this.hotelRoomModel.findById(id).exec();
  }

  async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const query: any = { hotel: params.hotel };
    
    if (params.isEnabled !== undefined) {
      query.isEnabled = params.isEnabled;
    }

    return this.hotelRoomModel
      .find(query)
      .limit(params.limit ?? 10)
      .skip(params.offset ?? 0)
      .exec();
  }

  async update(id: string, data: UpdateHotelRoomDto): Promise<HotelRoom> {
    const updatedRoom = await this.hotelRoomModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedRoom) {
      throw new NotFoundException('Hotel room not found');
    }
    return updatedRoom;
  }
}