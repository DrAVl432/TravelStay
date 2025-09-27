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

  if (!supportRequest) throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);

  const before = new Date(createdBefore); // защита
  const messages = supportRequest.messages as Message[];

  // Помечаем как прочитанные только входящие (от НЕ текущего пользователя) и только старше/равно before
  const toUpdate = messages.filter((m) => {
    const authorId = (m.author as any)?.toString?.() ?? String(m.author);
    const sentAt = new Date(m.sentAt);
    return authorId !== userId && !m.readAt && sentAt <= before;
  });

  if (!toUpdate.length) return { markedAsRead: 0 };

  const now = new Date();

  await this.messageModel.updateMany(
    { _id: { $in: toUpdate.map(m => m._id) } },
    { $set: { readAt: now } },
  ).exec();

  return { markedAsRead: toUpdate.length };
}

  async getUnreadCount(supportRequestId: string, userId: string) {
  const supportRequest = await this.supportRequestModel
    .findById(supportRequestId)
    .populate('messages')
    .exec();

  if (!supportRequest) throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);

  const unread = (supportRequest.messages as Message[]).filter((m) => {
    const authorId = (m.author as any)?.toString?.() ?? String(m.author);
    return !m.readAt && authorId !== userId;
  }).length;

  return { unreadCount: unread };
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

    return requests.map((request) => {
      const clientId = request.user?.toString?.() ?? String(request.user);
      const msgs = request.messages as Message[];

      // Для клиента считаем непрочитанные от собеседника (не клиент)
      const unreadFromManager = msgs.filter((m) => {
        const authorId = (m.author as any)?.toString?.() ?? String(m.author);
        return !m.readAt && authorId !== clientId;
      }).length;

      return {
        id: request._id.toString(),
        createdAt: request.createdAt,
        isActive: request.isActive,
        unreadCount: unreadFromManager,
        firstMessage: (msgs[0] as Message)?.text || 'Нет сообщений',
      };
    });
  }

  async getManagerSupportRequests({ isActive }: GetChatListParams) {
    const requests = await this.supportRequestModel
      .find(isActive !== undefined ? { isActive } : {})
      .populate('user')
      .populate('messages')
      .exec();

    return requests.map((request) => {
      const clientId =
        request.user?._id?.toString?.() ??
        request.user?.toString?.() ??
        '';

      const msgs = request.messages as Message[];

      // Для менеджера считаем непрочитанные от клиента
      const unreadFromClient = msgs.filter((m) => {
        const authorId = (m.author as any)?.toString?.() ?? String(m.author);
        return !m.readAt && authorId === clientId;
      }).length;

      return {
        id: request._id.toString(),
        createdAt: request.createdAt,
        isActive: request.isActive,
        client: {
          id: request.user?._id?.toString?.() || '',
          name: (request.user as any)?.name || 'Неизвестно',
          email: (request.user as any)?.email || 'Не указан',
          contactPhone: (request.user as any)?.contactPhone || 'Не указан',
        },
        unreadCount: unreadFromClient,
        firstMessage: (msgs[0] as Message)?.text || '',
      };
    });
  }
  
  async getSupportRequestDetails(supportRequestId: string) {
  const supportRequest = await this.supportRequestModel
    .findById(supportRequestId)
    .populate('messages')
    .exec();

  if (!supportRequest) {
    throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
  }

  return {
    firstMessage: (supportRequest.messages[0] as Message)?.text || 'Нет сообщений',
  };
}
}