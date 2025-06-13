import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelRoomDocument = HotelRoom & Document;

@Schema({
  timestamps: true,
})
export class HotelRoom {
  @Prop({ required: true })
  hotel!: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ default: true })
  isEnabled!: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);