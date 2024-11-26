import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';

@Module({
  providers: [SessionService],
})
export class SessionModule {}
