import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { MenusService } from '../service/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  async getMenus(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.menusService.getMenus(page, limit);
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Get(':menuId')
  async getMenuById(@Param('menuId') menuId: string) {
    const result = await this.menusService.getMenuById(menuId);
    return {
      data: result,
    };
  }

  @Get('name/:menuName')
  async getMenuByName(@Param('menuName') menuName: string) {
    const result = await this.menusService.getMenuByName(menuName);
    return {
      data: result,
    };
  }

  @Post()
  async createMenu(
    @Body() createMenuDto: CreateMenuDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.menusService.createMenu(
      createMenuDto,
      user.userId,
    );
    return {
      data: result,
    };
  }

  @Patch(':menuId')
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.menusService.updateMenu(menuId, updateMenuDto, user.userId);
  }

  @Delete(':menuId')
  async deleteMenu(@Param('menuId') menuId: string): Promise<void> {
    return this.menusService.deleteMenu(menuId);
  }
}
