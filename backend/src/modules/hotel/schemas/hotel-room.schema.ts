import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HotelRoomDocument = HotelRoom & Document;

@Schema({ timestamps: true })
export class HotelRoom {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Hotel' })
  hotel!: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ default: true })
  isEnabled!: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);