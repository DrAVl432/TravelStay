import { Schema, Types } from 'mongoose';

export const MessageSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  sentAt: { type: Date, required: true, index: true },
  readAt: { type: Date, default: null, index: true },
});