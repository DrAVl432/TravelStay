import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({
  timestamps: true,
})
export class Hotel {
  @Prop({ required: true, unique: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: Date.now }) // createdAt
  createdAt!: Date;

  @Prop({ required: true, default: Date.now }) // updatedAt
  updatedAt!: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);