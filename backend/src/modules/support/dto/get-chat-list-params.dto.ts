import { IsMongoId, IsBoolean, IsOptional } from 'class-validator';

export class GetChatListParams {
  @IsOptional()
  @IsMongoId()
  user!: string | null;

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true; // добавлено значение по умолчанию
}