import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { SessionModule } from '../libs/session/session.module';

@Module({
  imports: [SessionModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
