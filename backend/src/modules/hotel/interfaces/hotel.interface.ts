import { Hotel } from '../schemas/hotel.schema';
import { SearchHotelParams } from '../dto/search-hotel-params.dto';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { UpdateHotelDto } from '../dto/update-hotel.dto';

export interface IHotelService {
  create(data: CreateHotelDto): Promise<Hotel>;
  findById(id: string): Promise<Hotel | null>;
  search(params: SearchHotelParams): Promise<Hotel[]>;
  update(id: string, data: UpdateHotelDto): Promise<Hotel>;
}
export interface HotelWithId extends Hotel {
  id: string;
  name: string;
}