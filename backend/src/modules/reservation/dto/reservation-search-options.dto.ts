import { IsMongoId, IsDateString, IsOptional } from 'class-validator';

export class ReservationSearchOptions {
@IsOptional()
@IsMongoId()
userId?: string;

@IsOptional()
@IsDateString()
dateStart?: string;

@IsOptional()
@IsDateString()
dateEnd?: string;
}
