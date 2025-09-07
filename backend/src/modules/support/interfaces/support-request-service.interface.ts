import { CreateSupportRequestDto } from '../dto/create-support-request.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { MarkMessagesAsReadDto } from '../dto/mark-messages-read.dto';
import { GetChatListParams } from '../dto/get-chat-list.dto';
import { SupportRequest } from './support-request.interface';
import { Message } from './message.interface';

export interface ISupportRequestService {
  findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]>;
  sendMessage(data: SendMessageDto): Promise<Message>;
  getMessages(supportRequest: string): Promise<Message[]>;
  subscribe(
    handler: (supportRequest: SupportRequest, message: Message) => void,
  ): () => void;
}