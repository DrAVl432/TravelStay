import { IsMongoId, IsString } from 'class-validator';

export class CreateSupportRequestDto {
  @IsMongoId()
  user!: string;

  @IsString()
  text!: string; // Первое сообщение от пользователя
}