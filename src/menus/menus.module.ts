import { Module } from '@nestjs/common';
import { MenusService } from './service/menus.service';
import { MenusController } from './controller/menus.controller';
import { MenusRepository } from './repository/menus.repository';

@Module({
  controllers: [MenusController],
  providers: [MenusService, MenusRepository],
  exports: [MenusService, MenusRepository],
})
export class MenusModule {}
