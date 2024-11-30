import { Module } from '@nestjs/common';
import { UserActivitiesService } from './service/user-activities.service';
import { UserActivitiesRepository } from './repository/user-activities.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivities, UserActivitiesSchema } from './schema/user-activities.schema';
import { UserActivityInterceptor } from 'src/common/interceptor/user-activities.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserActivities.name, schema: UserActivitiesSchema }]),
  ],
  providers: [UserActivitiesService, UserActivitiesRepository],
  exports: [UserActivitiesService]
})
export class UserActivitiesModule {}
