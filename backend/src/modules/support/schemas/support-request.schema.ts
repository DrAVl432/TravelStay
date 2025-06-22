

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Message } from './message.schema';

export type SupportRequestDocument = SupportRequest & Document;

@Schema({ timestamps: true })
export class SupportRequest {
  @Prop({ required: true })
  user!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: [Message] })
  messages!: Message[];
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);
