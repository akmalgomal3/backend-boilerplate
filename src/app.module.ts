import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './libs/session/session.module';
import { UtilsModule } from './common/utils/utils.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { JwtModule } from './libs/jwt/jwt.module';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { SessionInterceptor } from './common/interceptor/session/session.interceptor';
import { ElasticsearchModule } from './libs/elasticsearch/elasticsearch.module';
import { HttpExceptionFilter } from './common/exceptions/http-exceptions.filter';
import { PrometheusModule } from './libs/prometheus/prometheus.module';
import { MetricsMiddleware } from './common/middlewares/metrics.middleware';

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
    PrometheusModule,
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
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(MetricsMiddleware)
      .exclude({
        path: '/metrics',
        method: RequestMethod.GET,
      })
      .forRoutes('*');
  }
}
