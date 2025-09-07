import { CreateSupportRequestDto } from '../dto/create-support-request.dto';
import { MarkMessagesAsReadDto } from '../dto/mark-messages-read.dto';
import { Message } from './message.interface';

export interface ISupportRequestClientService {
  createSupportRequest(data: CreateSupportRequestDto): Promise<void>;
  markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void>;
  getUnreadCount(supportRequest: string): Promise<number>;
}