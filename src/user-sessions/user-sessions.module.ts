import { Module } from '@nestjs/common';
import { UserSessionsService } from './service/user-sessions.service';
import { UserSessionsController } from './controller/user-sessions.controller';
import { UserSessionsRepository } from './repository/user-sessions.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessions, UserSessionSchema } from './schema/user-sessions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSessions.name, schema: UserSessionSchema }]),
  ],
  providers: [UserSessionsService, UserSessionsRepository],
  controllers: [UserSessionsController], 
  exports: [UserSessionsService]
})
export class UserSessionsModule {}
