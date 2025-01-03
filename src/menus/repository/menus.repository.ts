import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError, QueryRunner, Repository } from 'typeorm';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { MenusQuery } from '../query/menus.query';
import { AccessMenu } from '../entity/access_menu.entity';
import { AccessMenuQuery } from '../query/access_menu.query';
import { ErrorMessages } from 'src/common/exceptions/root-error.message';

@Injectable()
export class MenusRepository {
  private repository: Repository<Menu>;
  private repositoryAccessMenu: Repository<AccessMenu>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
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
      const menus = await this.repository.query(
        MenusQuery.GET_MENUS(skip, take, search),
      );
      const count = await this.repository.query(MenusQuery.COUNT_MENUS);

      return [menus, parseInt(count[0].count)];
    } catch (error) {
      throw error;
    }
  }

  async getMenuById(menuId: string): Promise<Menu | null> {
    try {
      const data = await this.repository.query(
        MenusQuery.GET_MENU_BY_ID(menuId),
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getMenuByName(menuName: string): Promise<Menu | null> {
    try {
      const data = await this.repository.query(
        MenusQuery.GET_MENU_BY_NAME(menuName),
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getMenusToCreateAccess(): Promise<Menu[] | []> {
    try {
      const query = MenusQuery.GET_MENUS_TO_CREATE_ACCESS;
      return await this.repository.query(query);
    } catch (error) {
      throw error;
    }
  }

  async createMenu(dto: CreateMenuDto, userId: string): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newMenu = await queryRunner.query(
        MenusQuery.CREATE_MENU(
          dto.menuName,
          dto.parentMenuId || null,
          dto.routePath,
          dto.icon || null,
          dto.hierarchyLevel,
          dto.description || null,
          dto.active ?? true,
          userId,
        ),
      );

      await queryRunner.commitTransaction();
      return newMenu[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      await queryRunner.query(
        MenusQuery.UPDATE_MENU(
          dto.menuName || null,
          dto.parentMenuId || null,
          dto.routePath || null,
          dto.icon || null,
          dto.hierarchyLevel || null,
          dto.description || null,
          dto.active ?? null,
          userId,
          menuId,
        ),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMenu(menuId: string[]): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(MenusQuery.DELETE_MENU(menuId));
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAccessMenuByRoleId(roleId: string): Promise<Menu[]> {
    try {
      const [getAccessMenu] = await this.repository.findAndCount({
        select: ['menuId', 'menuName', 'parentMenuId', 'hierarchyLevel', 'routePath', 'icon', 'active', 'description'],
        where: { 
          active: true,
          accessMenu: { role: { roleId } } 
        },
        order: { hierarchyLevel: 'ASC' },
      })
      return getAccessMenu;
    } catch (error) {
      throw error;
    }
  }

  async getAllMenuAccessByRoleId(roleId: string): Promise<Menu[]> {
    try {
      const query = AccessMenuQuery.GET_ALL_MENU_ACCESS_BY_ROLE_ID(roleId);
      const accessMenu = await this.repositoryAccessMenu.query(query);
      return accessMenu;
    } catch (error) {
      throw error;
    }
  }

  async getAccessMenuById(accessMenuId: string): Promise<AccessMenu> {
    try {
      const getById = await this.repositoryAccessMenu.findOneByOrFail({ accessMenuId });
      return getById;
    } catch (error) {
      if (error instanceof EntityNotFoundError){
        ErrorMessages.menus.dynamicMessage(
          ErrorMessages.menus.getMessage('ERRROR_GET_ONE_ACCESS_MENU_BY_ID'), 
          { accessMenuId }
        );
      }

      throw error;
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createAccessMenu(
    trx: QueryRunner,
    { roleId, menuId, createdBy },
  ): Promise<string> {
    try {
      const create = await trx.manager.insert(AccessMenu,{
        role: {roleId},
        menu: {menuId},
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
     
      return await create.identifiers[0].accessMenuId;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
}
