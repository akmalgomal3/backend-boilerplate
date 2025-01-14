import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityNotFoundError,
  ILike,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { MenusQuery } from '../query/menus.query';
import { AccessMenu } from '../entity/access_menu.entity';
import { AccessMenuQuery } from '../query/access_menu.query';
import { ErrorMessages } from 'src/common/exceptions/root-error.message';
import { UtilsService } from '../../libs/utils/services/utils.service';

@Injectable()
export class MenusRepository {
  private repository: Repository<Menu>;
  private repositoryAccessMenu: Repository<AccessMenu>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
    private utilsService: UtilsService,
  ) {
    this.repository = this.dataSource.getRepository(Menu);
    this.repositoryAccessMenu = this.dataSource.getRepository(AccessMenu);
  }

  async getMenus(
    skip: number,
    take: number,
    search: string,
  ): Promise<[Menu[], number]> {
    try {
      const [menus, totalCount] = await this.repository.findAndCount({
        where: [
          { menuName: ILike(`%${search}%`) },
          { description: ILike(`%${search}%`) },
        ],
        skip,
        take,
        order: {
          hierarchyLevel: 'ASC',
        },
      });

      return [menus, totalCount];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all menu',
        error.status || 500,
      );
    }
  }

  async getMenusNonHierarchy(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[any[], number]> {
    try {
      return await this.utilsService.getAllQuery(
        skip,
        take,
        filters,
        sorts,
        searchQuery,
        'menus',
        this.repository,
        [
          {
            table: 'menus',
            alias: 'parentMenu',
            condition: 'menus.parent_menu_id = parentMenu.menu_id',
          },
        ],
      );
    } catch (e) {
      throw e;
    }
  }

  async getMenuById(menuId: string): Promise<Menu | null> {
    try {
      const menu = await this.repository.findOne({
        where: { menuId },
      });

      return menu || null;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get menu by menu id',
        error.status || 500,
      );
    }
  }

  async getMenuByName(menuName: string): Promise<Menu | null> {
    try {
      const menu = await this.repository.findOne({
        where: { menuName: ILike(menuName) },
      });

      return menu || null;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get menu by name',
        error.status || 500,
      );
    }
  }

  async getMenusToCreateAccess(): Promise<Menu[] | []> {
    try {
      const query = MenusQuery.GET_MENUS_TO_CREATE_ACCESS;
      return await this.repository.query(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get menu to create access menu',
        error.status || 500,
      );
    }
  }

  async createMenu(dto: CreateMenuDto, userId: string): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newMenu = this.repository.create({
        menuName: dto.menuName,
        parentMenuId: dto.parentMenuId || null,
        routePath: dto.routePath,
        icon: dto.icon || null,
        hierarchyLevel: dto.hierarchyLevel,
        description: dto.description || null,
        active: dto.active ?? true,
        createdBy: userId,
        createdAt: new Date(),
      });

      const savedMenu = await queryRunner.manager.save(newMenu);

      await queryRunner.commitTransaction();
      return savedMenu.menuId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error create menu',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateMenu(
    menuId: string,
    dto: UpdateMenuDto,
    userId: string,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateData = {
        menuName: dto.menuName || undefined,
        parentMenuId: dto.parentMenuId || undefined,
        routePath: dto.routePath || undefined,
        icon: dto.icon || undefined,
        hierarchyLevel: dto.hierarchyLevel || undefined,
        description: dto.description || undefined,
        active: dto.active ?? undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      };

      await queryRunner.manager.update(Menu, { menuId }, updateData);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error update menu by menu id',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdateMenu(
    updates: { menuId: string; updateMenuDto: UpdateMenuDto }[],
    userId: string,
  ) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menuIds = updates.map(({ menuId }) => menuId);
      const menuMap = await this.getExistingMenus(menuIds);

      for (const { menuId, updateMenuDto } of updates) {
        await this.validateMenuExistence(menuId, updateMenuDto);
        await this.validateBulkCircularDependency(
          menuId,
          updateMenuDto.parentMenuId,
          menuMap,
        );
        const updateData = {
          menuName: updateMenuDto.menuName || undefined,
          parentMenuId: updateMenuDto.parentMenuId || undefined,
          routePath: updateMenuDto.routePath || undefined,
          icon: updateMenuDto.icon || undefined,
          hierarchyLevel: updateMenuDto.hierarchyLevel || undefined,
          description: updateMenuDto.description || undefined,
          active: updateMenuDto.active ?? undefined,
          updatedBy: userId,
          updatedAt: new Date(),
        };

        await queryRunner.manager.update(Menu, { menuId }, updateData);

        if (updateMenuDto.parentMenuId != null) {
          const updatedMenu = menuMap.get(menuId);
          updatedMenu.parentMenuId = updateMenuDto.parentMenuId;
          menuMap.set(menuId, updatedMenu);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error bulk update menus',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getExistingMenus(menuIds: string[]): Promise<Map<string, Menu>> {
    const existingMenus = await this.repository.find({
      where: { menuId: In(menuIds) },
    });

    return new Map(existingMenus.map((menu) => [menu.menuId, menu]));
  }

  async validateMenuExistence(
    menuId: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<void> {
    const isExist = await this.repository.findOne({ where: { menuId } });

    if (!isExist) {
      throw new NotFoundException(
        ErrorMessages.menus.dynamicMessage(
          ErrorMessages.menus.getMessage('ERROR_UPDATE_MENU_NOT_FOUND'),
          { menuId },
        ),
      );
    }

    if (updateMenuDto.parentMenuId != null) {
      const isParentExist = await this.repository.findOne({
        where: { menuId: updateMenuDto.parentMenuId },
      });

      if (!isParentExist) {
        throw new NotFoundException(
          ErrorMessages.menus.dynamicMessage(
            ErrorMessages.menus.getMessage(
              'ERROR_UPDATE_MENU_PARENT_NOT_FOUND',
            ),
            { menuId: updateMenuDto.parentMenuId },
          ),
        );
      }
    }
  }

  async validateBulkCircularDependency(
    menuId: string,
    parentMenuId: string,
    menuMap: Map<string, Menu>,
  ): Promise<void> {
    let currentMenuId = parentMenuId;

    while (currentMenuId) {
      if (currentMenuId === menuId) {
        throw new BadRequestException('Circular dependency detected');
      }

      const currentMenu = menuMap.get(currentMenuId);
      if (!currentMenu) {
        break;
      }

      currentMenuId = currentMenu.parentMenuId;
    }
  }

  async deleteMenu(menuId: string[]): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Menu, { menuId: In(menuId) });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error delete menu by menu id',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAccessMenuByRoleId(roleId: string): Promise<Menu[]> {
    try {
      const [getAccessMenu] = await this.repository.findAndCount({
        select: [
          'menuId',
          'menuName',
          'parentMenuId',
          'hierarchyLevel',
          'routePath',
          'icon',
          'active',
          'description',
        ],
        where: {
          active: true,
          accessMenu: { role: { roleId } },
        },
        order: { hierarchyLevel: 'ASC' },
      });
      return getAccessMenu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role id',
        error.status || 500,
      );
    }
  }

  async getAllMenuAccessByRoleId(roleId: string): Promise<Menu[]> {
    try {
      const query = AccessMenuQuery.GET_ALL_MENU_ACCESS_BY_ROLE_ID(roleId);
      const accessMenu = await this.repositoryAccessMenu.query(query);
      return accessMenu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all menu access by role id',
        error.status || 500,
      );
    }
  }

  async getAccessMenuById(accessMenuId: string): Promise<AccessMenu> {
    try {
      const getById = await this.repositoryAccessMenu.findOneByOrFail({
        accessMenuId,
      });
      return getById;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        ErrorMessages.menus.dynamicMessage(
          ErrorMessages.menus.getMessage('ERRROR_GET_ONE_ACCESS_MENU_BY_ID'),
          { accessMenuId },
        );
      }

      throw new HttpException(
        error.message || 'Error get access menu by access menu id',
        error.status || 500,
      );
    }
  }

  async createBulkAccessMenu(
    roleId: string,
    createdBy: string,
    menus: string[],
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.deleteAccessMenuTrxByRoleId(queryRunner, roleId);
      for (const menuId of menus) {
        await this.createAccessMenu(queryRunner, {
          roleId,
          menuId,
          createdBy,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error create bulk access menu',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createAccessMenu(
    trx: QueryRunner,
    { roleId, menuId, createdBy },
  ): Promise<string> {
    try {
      const create = await trx.manager.insert(AccessMenu, {
        role: { roleId },
        menu: { menuId },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await create.identifiers[0].accessMenuId;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create access menu',
        error.status || 500,
      );
    }
  }

  async deleteAccessMenuTrxByRoleId(
    trx: QueryRunner = null,
    roleId: string,
  ): Promise<void> {
    try {
      if (!trx) trx = this.repository.manager.connection.createQueryRunner();
      await trx.manager.delete(AccessMenu, { role: { roleId } });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access menu by role id',
        error.status || 500,
      );
    }
  }
}
