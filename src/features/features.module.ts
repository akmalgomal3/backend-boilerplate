import { Module } from '@nestjs/common';
import { FeaturesService } from './service/features.service';
import { FeaturesController } from './controller/features.controller';
import { FeaturesRepository } from './repository/features.repository';
import { UsersModule } from 'src/users/user.module';
import { RolesModule } from 'src/roles/roles.module';
import { MenusRepository } from '../menus/repository/menus.repository';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [FeaturesController],
  providers: [FeaturesService, FeaturesRepository, MenusRepository],
  exports: [FeaturesService, FeaturesRepository],
})
export class FeaturesModule {}
