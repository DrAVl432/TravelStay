import { IsMongoId, IsDateString } from 'class-validator';

export class ReservationDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  hotelId!: string;

  @IsMongoId()
  roomId!: string;

  @IsDateString()
  dateStart!: string;

  @IsDateString()
  dateEnd!: string;
}