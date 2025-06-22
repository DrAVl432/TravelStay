import { IsMongoId, IsDateString, IsNotEmpty } from 'class-validator';

export class ReservationDto {
  @IsNotEmpty()
  @IsMongoId()
  userId!: string;

  @IsNotEmpty()
  @IsMongoId()
  hotelId!: string;

  @IsNotEmpty()
  @IsMongoId()
  roomId!: string;

  @IsDateString()
  dateStart!: string;

  @IsDateString()
  dateEnd!: string;
}