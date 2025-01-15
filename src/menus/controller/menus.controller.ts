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
import { FormInfo } from '../../common/types/form-info.type';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BulkUpdateMenuDto } from '../dto/bulk-update-menu.dto';

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
    };
  }

  @Post('/get-all')
  async getMenusNonHierarchy(@Body() paginationDto: PaginationDto) {
    const result = await this.menusService.getMenusNonHierarchy(paginationDto);
    return {
      data: {
        body: result.data,
        sort: paginationDto.sorts || [],
        filter: paginationDto.filters || [],
        search: paginationDto.search || [],
      },
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
      data: {
        menuId: result,
      },
    };
  }

  @Patch('single-update/:menuId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.menusService.updateMenu(menuId, updateMenuDto, user.userId);
  }

  @Patch('bulk-update')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async bulkUpdateMenu(
    @Body() updates: BulkUpdateMenuDto[],
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.menusService.bulkUpdateMenu(updates, user.userId);
  }

  @Delete('single-delete/:menuId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async deleteMenu(@Param('menuId') menuId: string): Promise<void> {
    return this.menusService.deleteMenu(menuId);
  }

  @Delete('bulk-delete')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async bulkDeleteMenu(@Body() menuIds: { menuId: string }[]): Promise<void> {
    return this.menusService.bulkDeleteMenu(menuIds);
  }

  @Get('/header/info')
  async getHeaderInfo() {
    const result = await this.menusService.getMenuHeader();
    return {
      data: result,
    };
  }

  @Get('form/create-update')
  @ApiQuery({ name: 'id', required: false })
  async getFormCreateUpdate(
    @Query('id', new ParseUUIDPipe({ optional: true })) menuId: string,
  ): Promise<{ data: FormInfo }> {
    const formInfo = await this.menusService.formCreateUpdateMenu(menuId);
    return {
      data: formInfo,
    };
  }

  @Get('/accessMenu/header/info')
  async getAccessMenuHeader() {
    const result = this.menusService.getAccessMenuHeader();
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @Get('/accessMenu/user')
  async getAccessMenuByCurrentUser(@User() user: JwtPayload) {
    const result = await this.menusService.getAccessMenuByCurrentUser(
      user?.roleId,
    );
    return { data: result };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/accessMenu/create/body/:roleId')
  async getAllToCreateAccessMenu(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const result = await this.menusService.getAllMenuToCreateAccessMenu(roleId);
    return { data: result };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/accessMenu/create')
  async createAccessMenu(
    @Body() createAccessMenuDto: CreateUpdateBulkAccessMenuDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.menusService.createUpdateBulkAccessMenu({
      ...createAccessMenuDto,
      createdBy: user?.userId,
    });
    return { data: result };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Patch('/accessMenu/:roleId')
  async updateAccessMenu(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() updateAccessMenuDto: CreateUpdateBulkAccessMenuDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.menusService.createUpdateBulkAccessMenu({
      ...updateAccessMenuDto,
      roleId: user?.roleId,
      createdBy: user?.userId,
    });
    return { data: result };
  }

  @ApiBearerAuth()
  @Delete('/accessMenu/:roleId')
  async deleteAccessMenu(@Param('roleId', ParseUUIDPipe) roleId: string) {
    const result = await this.menusService.deleteAccessMenuByRoleId(roleId);
    return { data: result };
  }
}
