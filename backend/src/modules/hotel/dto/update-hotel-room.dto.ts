import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateHotelRoomDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}