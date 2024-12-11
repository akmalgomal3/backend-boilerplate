import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { SessionModule } from './libs/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    SessionModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
