import { Module } from '@nestjs/common';
import { FeaturesService } from './service/features.service';
import { FeaturesController } from './controller/features.controller';
import { FeaturesRepository } from './repository/features.repository';
import { UsersModule } from 'src/users/user.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [FeaturesController],
  providers: [FeaturesService, FeaturesRepository],
  exports: [FeaturesService, FeaturesRepository],
})
export class FeaturesModule {}
