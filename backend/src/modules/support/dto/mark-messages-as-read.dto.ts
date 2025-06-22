import { IsMongoId, IsDate } from 'class-validator';

export class MarkMessagesAsReadDto {
  @IsMongoId()
  user!: string; // ID пользователя

  @IsMongoId()
  supportRequest!: string; // ID обращения в техподдержку

  @IsDate()
  createdBefore!: Date; // Дата, до которой сообщения должны быть отмечены как прочитанные
}