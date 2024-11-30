import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_activities'})
export class UserActivities extends Document {
  @Prop({ required: true })
  device_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  device_type: string;

  @Prop()
  ip_address: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ type: () => Object })
  parameter: {};
  
  @Prop({ required: true })
  status: number;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const UserActivitiesSchema = SchemaFactory.createForClass(UserActivities);
