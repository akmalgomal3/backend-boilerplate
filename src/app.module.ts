import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './roles/guard/roles.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { UserSessionsModule } from './user-sessions/user-sessions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivitiesModule } from './user-activities/user-activities.module';
import { DeviceIdMiddleware } from './common/middleware/device-id.middleware';
import { UserActivityInterceptor } from './common/interceptor/user-activities.interceptor';
import { LastActivityInterceptor } from './common/interceptor/user-last-activity.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get<string>('MONGODB_URL')}/${configService.get<string>('MONGODB_DBNAME')}`,
      }),
    }),
    UsersModule,
    DatabaseModule,
    RolesModule,
    AuthModule,
    UserSessionsModule,
    UserActivitiesModule
  ],

  controllers: [],
  providers: [  
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }, 
    {
      provide: APP_INTERCEPTOR,
      useClass: UserActivityInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LastActivityInterceptor,
    },
  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceIdMiddleware).forRoutes('*');
  }
}
