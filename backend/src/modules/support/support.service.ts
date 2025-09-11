import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportGateway } from './support.gateway';
import { SupportRequest } from '../support/interfaces/support-request.interface';
import { Message } from './interfaces/message.interface';
import { GetChatListParams } from './dto/get-chat-list.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel('SupportRequest') private readonly supportRequestModel: Model<SupportRequest>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly supportGateway: SupportGateway,
  ) {}

  async createSupportRequest(userId: string, text: string) {
    const newSupportRequest = new this.supportRequestModel({
      user: userId,
      createdAt: new Date(),
      isActive: true,
    });
    await newSupportRequest.save();

    const message = new this.messageModel({
      author: new Types.ObjectId(userId),
      text,
      sentAt: new Date(),
    });
    await message.save();

    newSupportRequest.messages.push(message._id);
    await newSupportRequest.save();

       return await this.supportRequestModel
      .findById(newSupportRequest._id)
      .populate('messages')
      .exec();
  }

  async getMessages(supportRequestId: string) {
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate('messages')
      .exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    return supportRequest.messages;
  }

  async sendMessage(supportRequestId: string, authorId: string, text: string) {
    const message = new this.messageModel({
      author: new Types.ObjectId(authorId),
      text,
      sentAt: new Date(),
    });
    await message.save();

    const supportRequest = await this.supportRequestModel.findById(supportRequestId).exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    supportRequest.messages.push(message._id );
    await supportRequest.save();

    this.supportGateway.sendMessageToChat(supportRequestId, {
      id: message._id.toString(),
      text: message.text,
      sentAt: message.sentAt,
      author: { id: authorId },
    });

    return message;
  }

  async markMessagesAsRead(userId: string, supportRequestId: string, createdBefore: Date) {
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate({ path: 'messages', model: this.messageModel })
      .exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    const messages = supportRequest.messages as Message[];

    const updatedMessages = messages.filter(
      (msg: Message) => msg.author.toString() !== userId && msg.sentAt < createdBefore,
    );

    const updatePromises = updatedMessages.map((msg: Message) => {
      msg.readAt = new Date();
      return this.messageModel.updateOne({ _id: msg._id }, { readAt: msg.readAt }).exec();
    });

    await Promise.all(updatePromises);

    return { markedAsRead: updatedMessages.length };
  }

  async getUnreadCount(supportRequestId: string) {
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate('messages')
      .exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    const unreadMessages = (supportRequest.messages as Message[]).filter(
      (message) => !message.readAt,
    );

    return { unreadCount: unreadMessages.length };
  }

  async closeRequest(supportRequestId: string) {
    const supportRequest = await this.supportRequestModel.findById(supportRequestId).exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    supportRequest.isActive = false;
    await supportRequest.save();

    return { message: 'Обращение закрыто.' };
  }

  async getClientSupportRequests(userId: string) {
    const requests = await this.supportRequestModel
      .find({ user: userId })
      .populate('messages')
      .exec();

    return requests.map((request) => ({
      id: request._id.toString(),
      createdAt: request.createdAt,
      isActive: request.isActive,
      unreadCount: (request.messages as Message[]).filter((msg) => !msg.readAt).length,
      firstMessage: (request.messages[0] as Message)?.text || 'Нет сообщений',
    }));
  }

  async getManagerSupportRequests({ isActive }: GetChatListParams) {
    const requests = await this.supportRequestModel
      .find(isActive !== undefined ? { isActive } : {})
      .populate('user')
      .populate('messages')
      .exec();

    return requests.map((request) => ({
      id: request._id.toString(),
      createdAt: request.createdAt,
      isActive: request.isActive,
      client: {
        id: request.user?._id.toString() || '',
        name: request.user?.name || 'Неизвестно',
        email: request.user?.email || 'Не указан',
        contactPhone: request.user?.contactPhone || 'Не указан',
      },
      unreadCount: (request.messages as Message[]).filter((msg) => !msg.readAt).length,
      firstMessage: (request.messages[0] as Message)?.text || '',
    }));
  }
}