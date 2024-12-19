import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MenusRepository } from '../repository/menus.repository';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MenusService {
  constructor(private menusRepository: MenusRepository) {}

  async getMenus(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<Menu>> {
    try {
      const skip = (page - 1) * limit;
      const [menus, totalItems] = await this.menusRepository.getMenus(
        skip,
        limit,
      );
      const totalPages = Math.ceil(totalItems / limit);

      const hierarchicalMenus = this.buildMenuHierarchy(menus);

      return {
        data: hierarchicalMenus,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve menus, ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async getMenuById(menuId: string): Promise<Menu> {
    try {
      const menu = await this.menusRepository.getMenuById(menuId);

      if (!menu) {
        throw new NotFoundException(`Menu with ID ${menuId} not found`);
      }

      return menu;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve menus, ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async getMenuByName(menuName: string): Promise<Menu> {
    try {
      const menu = await this.menusRepository.getMenuByName(menuName);

      if (!menu) {
        throw new NotFoundException(`Menu with name ${menuName} not found`);
      }

      return menu;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve menus, ${error}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async createMenu(
    createMenuDto: CreateMenuDto,
    userId: string,
  ): Promise<string> {
    try {
      const nameAlreadyAvailable = await this.menusRepository.getMenuByName(
        createMenuDto.menuName,
      );

      if (nameAlreadyAvailable) {
        throw new HttpException(
          `Menu with name ${createMenuDto.menuName} already available!`,
          HttpStatus.CONFLICT,
        );
      }

      if (createMenuDto.parentMenuId != null) {
        const isParentExist = await this.menusRepository.getMenuById(
          createMenuDto.parentMenuId,
        );

        if (!isParentExist) {
          throw new NotFoundException(
            `Parent menu with id ${createMenuDto.parentMenuId} not exist!`,
          );
        }
      }

      const newMenu = await this.menusRepository.createMenu(
        {
          ...createMenuDto,
          active: createMenuDto.active ?? true,
        },
        userId,
      );
      return newMenu;
    } catch (error) {
      throw error;
    }
  }

  async updateMenu(
    menuId: string,
    updateMenuDto: UpdateMenuDto,
    userId: string,
  ): Promise<void> {
    try {
      const isExist = await this.getMenuById(menuId);

      if (!isExist) {
        throw new NotFoundException(`Menu with id ${menuId} not exist!`);
      }

      if (updateMenuDto.menuName != null) {
        const nameAlreadyAvailable = await this.menusRepository.getMenuByName(
          updateMenuDto.menuName,
        );

        if (nameAlreadyAvailable) {
          throw new HttpException(
            `Menu with name ${updateMenuDto.menuName} already available!`,
            HttpStatus.CONFLICT,
          );
        }
      }

      if (updateMenuDto.parentMenuId != null) {
        const isParentExist = await this.menusRepository.getMenuById(
          updateMenuDto.parentMenuId,
        );

        if (!isParentExist) {
          throw new NotFoundException(
            `Parent menu with id ${updateMenuDto.parentMenuId} not exist!`,
          );
        }
      }

      await this.menusRepository.updateMenu(menuId, updateMenuDto, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to update menu');
    }
  }

  async deleteMenu(menuId: string): Promise<void> {
    try {
      await this.getMenuById(menuId);

      await this.menusRepository.deleteMenu(menuId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to delete menu');
    }
  }

  private buildMenuHierarchy(menus: Menu[]): Menu[] {
    const menuMap = new Map(
      menus.map((menu) => [menu.menuId, { ...menu, children: [] }]),
    );

    const rootMenus: Menu[] = [];

    for (const menu of menuMap.values()) {
      if (menu.parentMenuId) {
        const parentMenu = menuMap.get(menu.parentMenuId);
        if (parentMenu) {
          parentMenu.children.push(menu);
        }
      } else {
        rootMenus.push(menu);
      }
    }

    return rootMenus;
  }
}
