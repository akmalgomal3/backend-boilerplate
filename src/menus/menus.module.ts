import { Module } from '@nestjs/common';
import { MenusService } from './service/menus.service';
import { MenusController } from './controller/menus.controller';
import { MenusRepository } from './repository/menus.repository';
import { UsersModule } from 'src/users/user.module';
import { RolesModule } from 'src/roles/roles.module';
import { FeaturesModule } from 'src/features/features.module';

@Module({
  imports: [UsersModule, RolesModule, FeaturesModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository],
  exports: [MenusService, MenusRepository],
})
export class MenusModule {}
