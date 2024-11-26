import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './databases/database.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UsersModule,
    DatabaseModule,
    RolesModule
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
