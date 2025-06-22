import { IsMongoId, IsString } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  author!: string;

  @IsMongoId()
  supportRequest!: string;

  @IsString()
  text!: string;
}
