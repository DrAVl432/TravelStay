import { IsArray, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator'; // добавлено

export class CreateHotelRoomDto {
  @IsNotEmpty()
  @IsMongoId() // добавлено для проверки, что это валидный ObjectId
  hotel!: string;

  @IsOptional()
  @IsString()
  description?: string;

 @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Проверка элемента массива
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean = true;
}