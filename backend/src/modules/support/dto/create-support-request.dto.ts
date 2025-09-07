import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupportRequestDto {
  @IsNotEmpty()
  @IsString()
  user: string = ''; // Значение по умолчанию

  @IsNotEmpty()
  @IsString()
  text: string = ''; // Значение по умолчанию
}