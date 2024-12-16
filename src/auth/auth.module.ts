import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controller/auth.controller';
import { UsersModule } from '../users/user.module';
import { UserLogActivitiesModule } from '../user_log_activities/user_log_activities.module';

@Module({
  imports: [UsersModule, UserLogActivitiesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
