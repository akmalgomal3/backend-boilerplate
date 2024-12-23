import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenusService } from '../service/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateAccessMenuDto } from '../dto/create-access-menu.dto';
import { UpdateAccessMenuDto } from '../dto/update-access-menu.dto';

@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async getMenuById(@Param('menuId') menuId: string) {
    const result = await this.menusService.getMenuById(menuId);
    return {
      data: result,
    };
  }

  @Get('name/:menuName')
  @ApiBearerAuth()
  async getMenuByName(@Param('menuName') menuName: string) {
    const result = await this.menusService.getMenuByName(menuName);
    return {
      data: result,
    };
  }

  @Post()
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.menusService.updateMenu(menuId, updateMenuDto, user.userId);
  }

  @Delete(':menuId')
  @ApiBearerAuth()
  async deleteMenu(@Param('menuId') menuId: string): Promise<void> {
    return this.menusService.deleteMenu(menuId);
  }

  @ApiBearerAuth()
  @Get('/accessMenu/:accessMenuId')
  async getAccessMenuById(
    @Param('accessMenuId', ParseUUIDPipe) accessMenuId: string,
  ){
    const result = await this.menusService.getAccessMenuById(accessMenuId);
    return { data: result }
  }

  @ApiBearerAuth()
  @Get('/accessMenu/role/:roleId')
  async getAccessMenuByRoleId(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ){
    const result = await this.menusService.getAccessMenuByRoleId(roleId);
    return result
  }

  @ApiBearerAuth()
  @Post('/accessMenu')
  async createAccessMenu(
    @Body() createAccessMenuDto: CreateAccessMenuDto,
    @User() user: JwtPayload,
  ){
    const result = await this.menusService.createAccessMenu({...createAccessMenuDto, createdBy: user?.userId});
    return { data: result }
  }

  @ApiBearerAuth()
  @Patch('/accessMenu/:accessMenuId')
  async updateAccessMenu(
    @Param('accessMenuId', ParseUUIDPipe) accessMenuId: string,
    @Body() updateAccessMenuDto: UpdateAccessMenuDto,
    @User() user: JwtPayload,
  ){
    const result = await this.menusService.updateAccessMenu(accessMenuId, {...updateAccessMenuDto, updatedBy: user?.userId});
    return { data: result }
  }

  @ApiBearerAuth()
  @Delete('/accessMenu/:accessMenuId')
  async deleteAccessMenu(
    @Param('accessMenuId', ParseUUIDPipe) accessMenuId: string,
  ){
    const result = await this.menusService.deleteAccessMenuById(accessMenuId);
    return { data: result }
  }
}
