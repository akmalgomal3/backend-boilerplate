import { Module } from '@nestjs/common';
import { UserLogActivitiesService } from './service/user_log_activities.service';
import { UserLogActivitiesController } from './controller/user_log_activities.controller';
import { UserLogActivitiesRepository } from './repository/user_log_activities.repository';
import { UserLogActivities, UserLogActivitiesSchema } from './entity/user_log_activities.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserLogActivities.name, schema: UserLogActivitiesSchema }]), 
    UsersModule
  ],
  providers: [UserLogActivitiesService, UserLogActivitiesRepository],
  controllers: [UserLogActivitiesController],
  exports: [UserLogActivitiesService]
})
export class UserLogActivitiesModule {}
