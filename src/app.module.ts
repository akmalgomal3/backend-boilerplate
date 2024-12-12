import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { SessionModule } from './libs/session/session.module';
import { UtilsModule } from './libs/utils/utils.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UserLogActivitiesModule } from './user_log_activities/user_log_activities.module';
import { UserLogAcitivitiesInterceptor } from './common/interceptor/user_log_activities/user_log_activities.interceptor';
import { JwtModule } from './libs/jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    SessionModule,
    UtilsModule,
    AuthModule,
    RolesModule,
    UserLogActivitiesModule,
    JwtModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserLogAcitivitiesInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
