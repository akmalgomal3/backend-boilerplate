import { Module } from '@nestjs/common';
import { FeaturesService } from './service/features.service';
import { FeaturesController } from './controller/features.controller';
import { FeaturesRepository } from './repository/features.repository';

@Module({
  controllers: [FeaturesController],
  providers: [FeaturesService, FeaturesRepository],
  exports: [FeaturesService, FeaturesRepository],
})
export class FeaturesModule {}
