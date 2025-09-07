import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  sentAt: { type: Date, required: true },
  text: { type: String, required: true },
  readAt: { type: Date },
});