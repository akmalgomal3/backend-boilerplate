import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UsersModule } from '../users/user.module';
import { SessionModule } from '../libs/session/session.module';
import { LogDataMiddleware } from '../common/middlewares/log-data.middleware';
import { ElasticsearchModule } from '../libs/elasticsearch/elasticsearch.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UsersModule, SessionModule, ElasticsearchModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LogDataMiddleware).forRoutes('*');
  }
}
