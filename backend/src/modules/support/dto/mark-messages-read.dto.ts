import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class MarkMessagesAsReadDto {
  @IsNotEmpty()
  @IsString()
  user: string = ''; // Значение по умолчанию

  @IsNotEmpty()
  @IsString()
  supportRequest: string = ''; // Значение по умолчанию

  @IsNotEmpty()
  @IsDate()
  createdBefore: Date = new Date(); // Значение по умолчанию
}