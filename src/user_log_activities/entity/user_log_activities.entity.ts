import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ActivityDeviceType, ActivityMethod, ActivityType } from '../enum/user_log_activities.enum';


@Schema({collection: 'user_log_activities'})
export class UserLogActivities {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: ActivityType })
  activity_type: string;

  @Prop({ required: true, enum: ActivityMethod })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  status_code: string;

  @Prop()
  description: string;

  @Prop({ type: Object })
  device?: {
    type: {
      type: string, 
      enum: ActivityDeviceType
    },
    info: {
      ip_address: string;
      latitude?: number;
      longitude?: number;
    };
  };

  @Prop({ type: Object })
  auth_details?: {
    login_time: Date;
    logout_time: Date;
  };

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ required: true })
  timestamp: Date;
}

export const UserLogActivitiesSchema = SchemaFactory.createForClass(UserLogActivities);