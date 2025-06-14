import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator'; // добавлено

export class CreateHotelRoomDto {
  @IsNotEmpty()
  @IsMongoId() // добавлено для проверки, что это валидный ObjectId
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