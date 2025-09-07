import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class GetChatListParams {
  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}