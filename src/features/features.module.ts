import { Module } from '@nestjs/common';
import { FeaturesService } from './service/features.service';
import { FeaturesController } from './controller/features.controller';
import { FeaturesRepository } from './repository/features.repository';
import { MenusRepository } from '../menus/repository/menus.repository';

@Module({
  controllers: [FeaturesController],
  providers: [FeaturesService, FeaturesRepository, MenusRepository],
  exports: [FeaturesService, FeaturesRepository],
})
export class FeaturesModule {}
