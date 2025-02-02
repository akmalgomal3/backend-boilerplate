import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { SessionModule } from './libs/session/session.module';
import { UtilsModule } from './libs/utils/utils.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UserLogActivitiesModule } from './user_log_activities/user_log_activities.module';
import { UserLogAcitivitiesInterceptor } from './common/interceptor/user_log_activities/user_log_activities.interceptor';
import { JwtModule } from './libs/jwt/jwt.module';
import { AuthGuard } from './common/guard/auth.guard';
import { RolesGuard } from './common/guard/roles.guard';
import { FeaturesModule } from './features/features.module';
import { MenusModule } from './menus/menus.module';
import { EmailModule } from './libs/email/email.module';
import { OptionsModule } from './options/options.module';

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
    FeaturesModule,
    MenusModule,
    EmailModule,
    OptionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserLogAcitivitiesInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
