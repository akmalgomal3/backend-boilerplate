import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenusService } from '../service/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateUpdateBulkAccessMenuDto } from '../dto/create_update_access_menu.dto';
import { AuthorizedRoles } from 'src/common/decorators/authorized-roles.decorator';
import { RoleType } from 'src/common/enums/user-roles.enum';

@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getMenus(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    const result = await this.menusService.getMenus(page, limit, search);
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Get(':menuId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getMenuById(@Param('menuId') menuId: string) {
    const result = await this.menusService.getMenuById(menuId);
    return {
      data: result,
    };
  }

  @Get('name/:menuName')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getMenuByName(@Param('menuName') menuName: string) {
    const result = await this.menusService.getMenuByName(menuName);
    return {
      data: result,
    };
  }

  @Post()
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
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
  @AuthorizedRoles(RoleType.Admin)
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.menusService.updateMenu(menuId, updateMenuDto, user.userId);
  }

  @Delete(':menuId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async deleteMenu(@Param('menuId') menuId: string): Promise<void> {
    return this.menusService.deleteMenu(menuId);
  }

  @ApiBearerAuth()
  @Get('/accessMenu/user')
  async getAccessMenuByCurrentUser(
    @User() user: JwtPayload,
  ){
    const result = await this.menusService.getAccessMenuByCurrentUser(user?.roleId);
    return { data: result }
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/accessMenu/:roleId')
  async getAccessMenuByRoleId(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ){
    const result = await this.menusService.getAccessMenuByRoleId(roleId);
    return { data: result }
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/accessMenu/create/body')
  async getAllToCreateAccessMenu(){
    const result = await this.menusService.getAllMenuToCreateAccessMenu();
    return { data: result }
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/accessMenu/create')
  async createAccessMenu(
    @Body() createAccessMenuDto: CreateUpdateBulkAccessMenuDto,
    @User() user: JwtPayload,
  ){
    const result = await this.menusService.createUpdateBulkAccessMenu({...createAccessMenuDto, createdBy: user?.userId});
    return { data: result }
  }

  @ApiBearerAuth()
  @Patch('/accessMenu/:roleId')
  async updateAccessMenu(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() updateAccessMenuDto: CreateUpdateBulkAccessMenuDto,
    @User() user: JwtPayload,
  ){
    const result = await this.menusService.createUpdateBulkAccessMenu({...updateAccessMenuDto, roleId, createdBy: user?.userId});
    return { data: result }
  }

  @ApiBearerAuth()
  @Delete('/accessMenu/:roleId')
  async deleteAccessMenu(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ){
    const result = await this.menusService.deleteAccessMenuByRoleId(roleId);
    return { data: result }
  }
}
