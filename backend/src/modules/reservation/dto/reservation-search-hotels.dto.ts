import { IsMongoId, IsDateString } from 'class-validator';

export class ReservationSearchHotels {
  @IsMongoId()
  hotelId!: string;

  @IsDateString()
  dateStart!: string;

  @IsDateString()
  dateEnd!: string;
}
export class ReservationSearchHotelsData {

  @IsDateString()
  dateStart!: string;

  @IsDateString()
  dateEnd!: string;
}
export class ReservationSearchHotel {
  @IsMongoId()
  hotelId!: string;
}