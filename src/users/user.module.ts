import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';

@Module({
  imports: [],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
