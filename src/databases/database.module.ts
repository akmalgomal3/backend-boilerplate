import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get<string>('MONGODB_URL')}/${configService.get<string>('MONGODB_DBNAME')}`,
      }),
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
  
})
export class DatabaseModule {}
