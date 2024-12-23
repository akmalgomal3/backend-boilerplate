import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { MenusQuery } from '../query/menus.query';
import { CreateAccessMenuDto } from '../dto/create-access-menu.dto';
import { AccessMenu } from '../entity/access_menu.entity';
import { create } from 'lodash';
import { Roles } from 'src/roles/entity/roles.entity';
import { UpdateAccessMenuDto } from '../dto/update-access-menu.dto';

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

  async getMenus(skip: number, take: number): Promise<[Menu[], number]> {
    try {
      const menus = await this.repository.query(MenusQuery.GET_MENUS, [
        skip,
        take,
      ]);
      const count = await this.repository.query(MenusQuery.COUNT_MENUS);

      return [menus, parseInt(count[0].count)];
    } catch (error) {
      throw error;
    }
  }

  async getMenuById(menuId: string): Promise<Menu | null> {
    try {
      const data = await this.repository.query(MenusQuery.GET_MENU_BY_ID, [
        menuId,
      ]);

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getMenuByName(menuName: string): Promise<Menu | null> {
    try {
      const data = await this.repository.query(MenusQuery.GET_MENU_BY_NAME, [
        menuName,
      ]);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async createMenu(dto: CreateMenuDto, userId: string): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newMenu = await queryRunner.query(MenusQuery.CREATE_MENU, [
        dto.menuName,
        dto.parentMenuId || null,
        dto.routePath,
        dto.icon || null,
        dto.hierarchyLevel,
        dto.description || null,
        dto.active ?? true,
        userId,
      ]);

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
      await queryRunner.query(MenusQuery.UPDATE_MENU, [
        dto.menuName || null,
        dto.parentMenuId || null,
        dto.routePath || null,
        dto.icon || null,
        dto.hierarchyLevel || null,
        dto.description || null,
        dto.active ?? null,
        userId,
        menuId,
      ]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMenu(menuId: string): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(MenusQuery.DELETE_MENU, [menuId]);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAccessMenuById(accessMenuId: string): Promise<Partial<AccessMenu>> {
    try {
      const query = `SELECT 
                      am.access_menu_id as "accessMenuId",
                      am.created_by as "createdBy",
                      am.created_at as "createdAt",
                      am.updated_at as "updatedAt",
                      am.updated_by as "updatedBy",
                      am.role_id as "roleId", 
                      r.role_name as "roleName",
                      r.role_type as "roleType",
                      am.menu_id as "menuId", 
                      m.menu_name as "menuName"
                    FROM access_menu am
                      LEFT JOIN roles r ON am.role_id = r.role_id
                      LEFT JOIN menus m ON am.menu_id = m.menu_id
                    WHERE am.access_menu_id = $1
                    `;
      const [accessMenu] = await this.repositoryAccessMenu.query(query, [
        accessMenuId,
      ]);

      return {
        accessMenuId: accessMenu.accessMenuId,
        createdBy: accessMenu.createdBy,
        createdAt: accessMenu.createdAt,
        updatedAt: accessMenu.updatedAt,
        updatedBy: accessMenu.updatedBy,
        role: {
          roleId: accessMenu.roleId,
          roleName: accessMenu.roleName,
          roleType: accessMenu.roleType,
        },
        menu: {
          menuId: accessMenu.menuId,
          menuName: accessMenu.menuName,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccessMenuByRoleId(roleId: string): Promise<Menu[]> {
    try {
      const query = `SELECT 
                      access_menu.access_menu_id as "accessMenuId",
                      role_id as "roleId", 
                      access_menu.menu_id as "menuId", 
                      menus.menu_name as "menuName",
                      parent_menu_id as "parentMenuId",
                      hierarchy_level as "hierarchyLevel",
                      route_path as "routePath", 
                      icon as icon, 
                      active as active
                    FROM access_menu 
                      LEFT JOIN menus ON access_menu.menu_id = menus.menu_id
                    WHERE access_menu.role_id = $1 AND menus.active = true
                    ORDER BY menus.hierarchy_level ASC
                    `;
      const accessMenu = await this.repositoryAccessMenu.query(query, [roleId]);
      return accessMenu;
    } catch (error) {
      throw error;
    }
  }

  async getAccessMenuByRoleMenuId(
    roleId: string,
    menuId: string,
  ): Promise<AccessMenu> {
    try {
      return await this.repositoryAccessMenu.findOne({
        where: { role: { roleId }, menu: { menuId } },
      });
    } catch (error) {
      throw error;
    }
  }

  async createAccessMenu(
    createAccessMenuDto: CreateAccessMenuDto,
  ): Promise<AccessMenu> {
    try {
      const { roleId, menuId, createdBy } = createAccessMenuDto;
      const query = `INSERT INTO access_menu (role_id, menu_id, created_by, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING access_menu_id as "accessMenuId", menu_id as "menuId", role_id as "roleId", created_by as "createdBy"`;
      const [create] = await this.repositoryAccessMenu.query(query, [
        roleId,
        menuId,
        createdBy,
      ]);

      return create;
    } catch (error) {
      throw error;
    }
  }

  async updateAccessMenu(
    accessMenuId: string,
    updateAccessMenuDto: UpdateAccessMenuDto,
  ): Promise<AccessMenu> {
    try {
      const { roleId, menuId, updatedBy } = updateAccessMenuDto;
      const query = `UPDATE access_menu SET role_id = $1, menu_id = $2, updated_by= $3, updated_at = NOW() WHERE access_menu_id = $4 RETURNING access_menu_id as "accessMenuId", menu_id as "menuId", role_id as "roleId", updated_by as "updatedBy"`;
      const [update] = await this.repositoryAccessMenu.query(query, [
        roleId,
        menuId,
        updatedBy,
        accessMenuId,
      ]);

      return update;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccessMenu(accessMenuId: string): Promise<AccessMenu> {
    try {
      const query = `DELETE FROM access_menu WHERE access_menu_id = $1 RETURNING access_menu_id as "accessMenuId", menu_id as "menuId", role_id as "roleId", created_by as "createdBy"`;
      const [deleteAccessMenu] = await this.repositoryAccessMenu.query(query, [accessMenuId]);

      return deleteAccessMenu;
    } catch (error) {
      throw error;
    }
  }
}
