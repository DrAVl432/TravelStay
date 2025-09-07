import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  author: string = ''; // Значение по умолчанию

  @IsNotEmpty()
  @IsString()
  supportRequest: string = ''; // Значение по умолчанию

  @IsNotEmpty()
  @IsString()
  text: string = ''; // Значение по умолчанию
}