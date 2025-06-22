import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportRequest, SupportRequestDocument } from './schemas/support-request.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetChatListParams } from './dto/get-chat-list-params.dto';
import { MarkMessagesAsReadDto } from './dto/mark-messages-as-read.dto';

@Injectable()
export class SupportRequestService {
  constructor(
    @InjectModel(SupportRequest.name) private supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequest> {
    const supportRequest = new this.supportRequestModel(data);
    return supportRequest.save();
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const message = new this.messageModel(data);
    await message.save();
    return message;
  }

  async findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]> {
    return this.supportRequestModel.find({ user: params.user, isActive: params.isActive });
  }

  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    const { user, supportRequest, createdBefore } = params;
    await this.messageModel.updateMany({
      supportRequest,
      readAt: null,
      author: { $ne: user },
      sentAt: { $lt: createdBefore },
    }, { $set: { readAt: new Date() } });
  }

  async closeRequest(supportRequestId: string): Promise<void> {
    await this.supportRequestModel.updateOne({ _id: supportRequestId }, { $set: { isActive: false } });
  }
}