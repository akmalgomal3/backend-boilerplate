import { Module } from '@nestjs/common';
import { NotificationGateaway } from './gateaway/notifications.gateaway';
import { UserSessionsModule } from 'src/user-sessions/user-sessions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessions, UserSessionSchema } from 'src/user-sessions/schema/user-sessions.schema';

@Module({
    imports: [
        UserSessionsModule, 
        MongooseModule.forFeature([{ name: UserSessions.name, schema: UserSessionSchema }])
    ],
    providers: [NotificationGateaway],
})
export class NotificationsModule {}
