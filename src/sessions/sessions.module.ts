import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { DatabaseModule } from '../databases/database.module'; // Import the database module

@Module({
  imports: [DatabaseModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
