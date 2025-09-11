export interface Message {
  _id: string;
  text: string;
  sentAt: Date;
  readAt?: Date;
  author: string; // Связь с пользователем
   }