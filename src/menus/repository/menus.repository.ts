import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { MenusQuery } from '../query/menus.query';

@Injectable()
export class MenusRepository {
  private repository: Repository<Menu>;
  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Menu);
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
}
