import { IsOptional, IsString, IsMongoId, IsDateString } from 'class-validator';

export class ReservationUserSearchDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsMongoId()
  hotelId?: string;

  @IsOptional()
  @IsDateString()
  dateStart?: string;

  @IsOptional()
  @IsDateString()
  dateEnd?: string;

  @IsOptional()
  @IsString()
  q?: string; // Универсальный параметр поиска
}