import { Schema, Types } from 'mongoose';

export const SupportRequestSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, required: true },
  messages: [{ type: Types.ObjectId, ref: 'Message' }],
  isActive: { type: Boolean, default: true },
});