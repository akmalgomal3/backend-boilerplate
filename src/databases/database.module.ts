import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';

@Global()
@Module({
  imports: [],
  providers: [...databaseProviders],
  controllers: [],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
