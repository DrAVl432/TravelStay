import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkMessagesAsReadDto {
  @IsNotEmpty()
  @IsString()
  user!: string;

  @IsNotEmpty()
  @IsString()
  supportRequest!: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createdBefore!: Date;
}