import { Schema, Types } from 'mongoose';

export const MessageSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, required: true },
  readAt: { type: Date },
});