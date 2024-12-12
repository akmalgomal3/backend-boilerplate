import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { databaseProviders } from 'src/databases/database.provider';

@Module({
  imports: [],
  providers: [UserRepository, UserService],
  controllers: [UserController],
})
export class UsersModule {}
