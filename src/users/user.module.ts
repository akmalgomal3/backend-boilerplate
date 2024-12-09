import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { SessionModule } from '../libs/session/session.module';
import { ElasticsearchModule } from '../libs/elasticsearch/elasticsearch.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SessionModule, ElasticsearchModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
