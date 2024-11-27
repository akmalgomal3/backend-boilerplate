import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { databaseProviders } from '../../databases/database.provider';
import { SessionRepository } from './repository/session.repository';
import { DatabaseModule } from '../../databases/database.module';

@Module({
  providers: [SessionRepository, SessionService],
  imports: [DatabaseModule],
  exports: [SessionService],
})
export class SessionModule {}
