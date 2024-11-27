import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './libs/session/session.module';
import { UtilsModule } from './common/utils/utils.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { JwtModule } from './libs/jwt/jwt.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { SessionInterceptor } from './common/interceptor/session/session.interceptor';
import { ElasticsearchModule } from './libs/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
    UsersModule,
    AuthModule,
    SessionModule,
    UtilsModule,
    JwtModule,
    ElasticsearchModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
  ],
})
export class AppModule {}
