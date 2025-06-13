import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateHotelRoomDto {
  @IsNotEmpty()
  hotel!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  images?: string[] = [];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean = true;
}