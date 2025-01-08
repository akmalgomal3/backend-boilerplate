import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { RolesModule } from '../roles/roles.module';
import { UserLogActivitiesModule } from 'src/user_log_activities/user_log_activities.module';

@Module({
  imports: [UserLogActivitiesModule, RolesModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
