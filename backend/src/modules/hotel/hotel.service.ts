import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { SearchHotelParams } from './dto/search-hotel-params.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>,
  ) {}

  async create(data: CreateHotelDto): Promise<Hotel> {
    const exists = await this.hotelModel.findOne({ title: data.title });
    if (exists) {
      throw new ConflictException('Hotel title already exists');
    }

    const hotel = new this.hotelModel(data);
    return hotel.save();
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.hotelModel.findById(id).exec();
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const query: any = {};
    if (params.title) {
      query.title = { $regex: params.title, $options: 'i' };
    }

    return this.hotelModel
      .find(query)
      .limit(params.limit ?? 10)
      .skip(params.offset ?? 0)
      .exec();
  }

  async update(id: string, data: UpdateHotelDto): Promise<Hotel | null> {
    const updatedHotel = await this.hotelModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedHotel) {
      throw new BadRequestException('Hotel not found');
    }
    return updatedHotel;
  }
}