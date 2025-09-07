import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Импорт Types для ObjectId
import { SupportGateway } from './support.gateway';
import { SupportRequest } from '../support/interfaces/support-request.interface';
import { Message } from './interfaces/message.interface';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel('SupportRequest') private readonly supportRequestModel: Model<SupportRequest>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly supportGateway: SupportGateway,
  ) {}

  // Метод создания нового обращения
  async createSupportRequest(userId: string, text: string) {
    // Создаем новое обращение
    const newSupportRequest = new this.supportRequestModel({
      user: userId,
      createdAt: new Date(),
      isActive: true,
    });
    await newSupportRequest.save();

    // Создаем первое сообщение для обращения
    const message = new this.messageModel({
      author: userId,
      text,
      sentAt: new Date(),
    });
    await message.save();

    // Добавляем сообщение в массив messages обращения
    newSupportRequest.messages.push(message._id as Types.ObjectId);
    await newSupportRequest.save();

    // Возвращаем созданное обращение
    return newSupportRequest;
  }

  // Метод получения сообщений из обращения
  async getMessages(supportRequestId: string) {
    // Находим обращение
    const supportRequest = await this.supportRequestModel
      .findById(supportRequestId)
      .populate('messages') // Загружаем связанные сообщения
      .exec();

    if (!supportRequest) {
      throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
    }

    // Возвращаем список сообщений
    return supportRequest.messages;
  }

async sendMessage(supportRequestId: string, authorId: string, text: string) {
  const message = new this.messageModel({ author: authorId, text, sentAt: new Date() });
  await message.save();

  const supportRequest = await this.supportRequestModel.findById(supportRequestId).exec();

  if (!supportRequest) {
    throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
  }

  supportRequest.messages.push(message._id as Types.ObjectId);
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
    .populate('messages')
    .exec();

  if (!supportRequest) {
    throw new Error(`Обращение с ID "${supportRequestId}" не найдено.`);
  }

  const updatedMessages = supportRequest.messages.filter(
    (message: any) => message.author.toString() !== userId && message.sentAt < createdBefore
  );

  const promises = updatedMessages.map((message: any) => {
    message.readAt = new Date();
    return message.save();
  });

  await Promise.all(promises);

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

  const unreadMessages = supportRequest.messages.filter(
    (message: any) => !message.readAt
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

}