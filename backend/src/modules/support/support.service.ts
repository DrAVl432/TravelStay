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
      user: new Types.ObjectId(userId),
      createdAt: new Date(),
      isActive: true,
      messages: [],
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

    return {
      id: newSupportRequest._id.toString(),
      createdAt: newSupportRequest.createdAt,
      isActive: newSupportRequest.isActive,
      firstMessage: message.text,
    };
  }

  async getMessages(supportRequestId: string) {
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate('messages')
      .exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    const messages = (supportRequest.messages as Message[]).map((m) => ({
      _id: (m as any)._id?.toString?.() ?? '',
      text: m.text,
      sentAt: m.sentAt,
      readAt: (m as any).readAt ?? null,
      author: (m.author as any)?.toString?.() ?? String(m.author),
    }));

    return {
      isActive: supportRequest.isActive,
      messages,
    };
  }

  async sendMessage(supportRequestId: string, authorId: string, text: string) {
    const supportRequest = await this.supportRequestModel.findById(supportRequestId).exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    if (!supportRequest.isActive) {
      throw new Error('Обращение закрыто. Отправка сообщений запрещена.');
    }

    const message = new this.messageModel({
      author: new Types.ObjectId(authorId),
      text,
      sentAt: new Date(),
    });
    await message.save();

    supportRequest.messages.push(message._id);
    await supportRequest.save();

    // Отдаем в сокет единый формат
    this.supportGateway.sendMessageToChat(supportRequestId, {
      _id: message._id.toString(),
      text: message.text,
      sentAt: message.sentAt,
      author: message.author.toString(),
    });

    return {
      _id: message._id.toString(),
      text: message.text,
      sentAt: message.sentAt,
      author: message.author.toString(),
    };
  }

  async markMessagesAsRead(userId: string, supportRequestId: string, createdBeforeISO: string) {
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate({ path: 'messages', model: this.messageModel })
      .exec();

    if (!supportRequest) throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);

    const before = new Date(createdBeforeISO);
    const messages = supportRequest.messages as Message[];

    const toUpdate = messages.filter((m) => {
      const authorId = (m.author as any)?.toString?.() ?? String(m.author);
      const sentAt = new Date(m.sentAt);
      return authorId !== userId && !m.readAt && sentAt <= before;
    });

    if (!toUpdate.length) return { markedAsRead: 0 };

    const now = new Date();

    await this.messageModel.updateMany(
      { _id: { $in: toUpdate.map((m) => (m as any)._id) } },
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

      const unreadFromManager = msgs.filter((m) => {
        const authorId = (m.author as any)?.toString?.() ?? String(m.author);
        return !m.readAt && authorId !== clientId;
      }).length;

      return {
        id: request._id.toString(),
        createdAt: request.createdAt,
        isActive: request.isActive,
        unreadCountFromManager: unreadFromManager,
        firstMessage: (msgs[0] as Message)?.text || 'Нет сообщений',
      };
    });
  }

  async getManagerSupportRequests({ isActive }: GetChatListParams) {
    const filter = typeof isActive === 'boolean' ? { isActive } : {};
    const requests = await this.supportRequestModel
      .find(filter)
      .populate('user')
      .populate('messages')
      .exec();

    return requests.map((request) => {
      const clientId =
        (request.user as any)?._id?.toString?.() ??
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
          id: (request.user as any)?._id?.toString?.() || '',
          name: (request.user as any)?.name || 'Неизвестно',
          email: (request.user as any)?.email || 'Не указан',
          contactPhone: (request.user as any)?.contactPhone || 'Не указан',
        },
        unreadCountFromClient: unreadFromClient,
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
      isActive: supportRequest.isActive,
      firstMessage: (supportRequest.messages[0] as Message)?.text || 'Нет сообщений',
    };
  }
}