import { IsString, IsOptional, IsBoolean, IsArray  } from 'class-validator';

export class UpdateHotelRoomDto {
  @IsOptional()
  @IsString()
  description?: string;

   @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Проверка элемента массива
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}