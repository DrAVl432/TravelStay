export interface Message {
  _id: string;
  text: string;
  sentAt: Date;
  readAt?: Date;
  author: string; 
  // {
  //   id: string;
  //   name: string;
  // };// Связь с пользователем
   }