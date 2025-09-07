import { Schema } from 'mongoose';

export const SupportRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});