import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

@IsOptional()
  @IsArray()
  @IsString({ each: true }) // Проверка, что каждый элемент массива — строка
  images?: string[];
}