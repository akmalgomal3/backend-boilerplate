import { Module } from '@nestjs/common';
import { OptionsService } from './service/options.service';
import { OptionsController } from './controller/options.controller';
import { OptionsRepository } from './repository/options.repository';

@Module({
  controllers: [OptionsController],
  providers: [OptionsService, OptionsRepository],
  exports: [OptionsService, OptionsRepository],
})
export class OptionsModule {}
