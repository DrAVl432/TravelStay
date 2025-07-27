//user.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // createdAt, updatedAt
})
export class User {
 @Prop({ type: Types.ObjectId, auto: true }) 
  id!: Types.ObjectId;

  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  contactPhone?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT }) 
  role!: UserRole; 
}

export const UserSchema = SchemaFactory.createForClass(User);
