import { Module } from '@nestjs/common';
import { RolesController } from './controller/roles.controller';
import { RolesService } from './services/roles.service';
import { RolesRepository } from './repository/roles.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository]
})
export class RolesModule {}
