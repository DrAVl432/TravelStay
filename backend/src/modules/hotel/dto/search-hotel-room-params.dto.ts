import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IsMongoId } from 'class-validator'; // добавлено

export class SearchRoomsParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = 0;

  @IsMongoId() // добавлено для проверки, что это валидный ObjectId
  @IsString()
  hotel!: string;

  @IsOptional()
  isEnabled?: boolean;
}