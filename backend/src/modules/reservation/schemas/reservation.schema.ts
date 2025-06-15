import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true }) // Включает поля createdAt и updatedAt
export class Reservation {
  @Prop({ required: true })
  userId!: string;  // Используем string, если не ставим reference

  @Prop({ required: true })
  hotelId!: string; // Используем string, если не ставим reference

  @Prop({ required: true })
  roomId!: string; // Используем string, если не ставим reference

  @Prop({ required: true })
  dateStart!: Date;

  @Prop({ required: true })
  dateEnd!: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);