import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {  Document, Types } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({
  timestamps: true,
})
export class Hotel {
  @Prop({ required: true, unique: true })
  title!: string;

  @Prop()
  description?: string;

   @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ required: true, default: Date.now }) // createdAt
  createdAt!: Date;

  @Prop({ required: true, default: Date.now }) // updatedAt
  updatedAt!: Date;

  id?: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);