import { IsMongoId, IsDateString } from 'class-validator';

export class ReservationSearchOptions {
  @IsMongoId()
  userId!: string;

  @IsDateString()
  dateStart!: string;

  @IsDateString()
  dateEnd!: string;
}