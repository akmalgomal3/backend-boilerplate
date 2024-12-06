import { Module } from '@nestjs/common';
import { CsrfController } from './controller/csrf.controller';
@Module({
  controllers: [CsrfController],
})
export class CsrfModule {}
