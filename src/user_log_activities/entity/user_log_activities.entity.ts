import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ActivityDeviceType, ActivityMethod, ActivityType } from '../enum/user_log_activities.enum';


@Schema({collection: 'user_log_activities'})
export class UserLogActivities {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, default: 'unknown'})
  username: string;

  @Prop({ required: true, enum: ActivityType })
  activity_type: ActivityType;

  @Prop({ required: true, enum: ActivityMethod })
  method: string;

  @Prop({ required: true})
  path: string;

  @Prop({ required: true, default: null})
  status_code: string;

  @Prop({ default: null })
  description: string | null

  @Prop({ type: Object})
  device?: {
    type: {
      type: string, 
      enum: ActivityDeviceType, 
    } | null,
    info: {
      ip_address: string | null;
      latitude?: number | null;
      longitude?: number | null;
    };
  };

  @Prop({ type: Object })
  auth_details?: {
    login_time?: Date | null;
    logout_time?: Date | null;
  } | null;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const UserLogActivitiesSchema = SchemaFactory.createForClass(UserLogActivities);