import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  images?: string[];

}