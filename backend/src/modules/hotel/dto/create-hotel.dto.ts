import {IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description!: string;

   @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Проверка элемента массива
  images?: string[];

}