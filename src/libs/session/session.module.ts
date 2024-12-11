import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionService } from './service/session.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
