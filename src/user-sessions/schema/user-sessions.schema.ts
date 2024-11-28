import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_sessions'})
export class UserSessions extends Document {
  @Prop({ required: true })
  device_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  device_type: string;

  @Prop({ required: true })
  expired_at: Date;

  @Prop({ required: true })
  last_activity_at: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSessions);
