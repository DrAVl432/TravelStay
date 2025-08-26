import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, type: String, ref: 'User' }) 
  userId!: string;

  @Prop({ required: true, type: String, ref: 'Hotel' }) 
  hotelId!: string;

  @Prop({ required: true, type: String, ref: 'HotelRoom' }) 
  roomId!: string;

  @Prop({ required: true })
  dateStart!: Date;

  @Prop({ required: true })
  dateEnd!: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);