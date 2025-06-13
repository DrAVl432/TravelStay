import { IsString, IsOptional } from 'class-validator';

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}