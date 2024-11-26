import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { RolesModule } from './roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivityService } from './user-activity/services/user-activity.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UsersModule,
    DatabaseModule,
    RolesModule,
    AuthModule
  ],

  controllers: [],
  providers: [UserActivityService],
})
export class AppModule { }
