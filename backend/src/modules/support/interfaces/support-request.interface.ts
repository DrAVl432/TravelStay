import { Types } from 'mongoose';
import { Message } from './message.interface';

export    interface SupportRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    contactPhone: string;
  };
  messages: (string | Message)[];
  isActive: boolean;
  createdAt: Date;
   }