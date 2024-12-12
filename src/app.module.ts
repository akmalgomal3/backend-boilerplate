import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { UtilsModule } from './libs/utils/utils.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UserLogActivitiesModule } from './user_log_activities/user_log_activities.module';
import { UserLogAcitivitiesInterceptor } from './common/interceptor/user_log_activities/user_log_activities.interceptor';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    UtilsModule,
    AuthModule,
    RolesModule,
    UserLogActivitiesModule,
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
