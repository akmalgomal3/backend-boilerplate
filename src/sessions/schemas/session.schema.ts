import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema()
export class Session {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop()
  deviceType: string;

  @Prop()
  ipAddress: string;

  @Prop({ default: Date.now })
  loginTime: Date;

  @Prop()
  logoutTime: Date;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
