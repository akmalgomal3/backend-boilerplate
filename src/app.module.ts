import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { RolesModule } from './roles/roles.module';
import { UserActivityService } from './user-activity/services/user-activity.service';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './roles/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt.guard';

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
  providers: [
    UserActivityService,  
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule { }
