import { Types } from 'mongoose';
import { Message } from './message.interface';

export interface SupportRequest {
  id: string; // ID обращения
  user: string; // ID пользователя, создавшего обращение
  createdAt: Date; // Дата создания обращения
  messages: Types.ObjectId[]; // Массив ObjectId, вместо Message[]
  isActive: boolean; // Статус активности обращения
}