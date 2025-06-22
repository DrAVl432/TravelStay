import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: String }) // нужно указать правильный тип
  author!: string;

  @Prop({ required: true })
  text!: string;

  @Prop()
  readAt?: Date;

  @Prop({ default: Date.now })
  sentAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);