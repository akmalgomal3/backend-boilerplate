import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { MenusRepository } from '../repository/menus.repository';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import {
  CreateAccessMenuDto,
  CreateUpdateBulkAccessMenuDto,
} from '../dto/create_update_access_menu.dto';
import { RolesService } from 'src/roles/service/roles.service';
import { UserService } from 'src/users/services/user.service';
import { FeaturesService } from 'src/features/service/features.service';
import { Features } from 'src/features/entity/features.entity';

@Injectable()
export class MenusService {
  constructor(
    private menusRepository: MenusRepository,
    private featuresService: FeaturesService,
    private roleService: RolesService,
    private userService: UserService,
  ) {}

  async getMenus(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ data: {}; metadata: {} }> {
    try {
      const skip = (page - 1) * limit;
      const [menus, totalItems] = await this.menusRepository.getMenus(
        skip,
        limit,
        search,
      );
      const totalPages = Math.ceil(totalItems / limit);
      const hierarchicalMenus = await this.buildMenuHierarchy(menus);

      return {
        data: {
          globalFeature: await this.featuresService.getFeatureNoMenuId(),
          menus: hierarchicalMenus,
        },
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all menu',
        error.status || 500,
      );
    }
  }

  async getMenuById(menuId: string): Promise<Menu> {
    try {
      const menu = await this.menusRepository.getMenuById(menuId);

      console.log(!menu);
      if (!menu) {
        throw new NotFoundException(`Menu with ID ${menuId} not found`);
      }

      return menu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get menu by id',
        error.status || 500,
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
      throw new HttpException(
        error.message || 'Error get menu by name',
        error.status || 500,
      );
    }
  }

  async createMenu(
    createMenuDto: CreateMenuDto,
    userId: string,
  ): Promise<string> {
    try {
      if (createMenuDto.parentMenuId != null) {
        const isParentExist = await this.menusRepository.getMenuById(
          createMenuDto.parentMenuId,
        );

        console.log(isParentExist);
        if (isParentExist == null) {
          throw new NotFoundException(
            `Parent menu with id ${createMenuDto.parentMenuId} not exist!`,
          );
        }
      }

      return await this.menusRepository.createMenu(
        {
          ...createMenuDto,
          active: createMenuDto.active ?? true,
        },
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create menu',
        error.status || 500,
      );
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
      throw new HttpException(
        error.message || 'Error update menu',
        error.status || 500,
      );
    }
  }

  async deleteMenu(menuId: string): Promise<void> {
    try {
      await this.getMenuById(menuId);

      const allMenus = await this.getMenus(1, 100000);

      const menuIdsWillDelete = this.getAllMenuChildId(
        allMenus.data['menus'],
        menuId,
      );

      await this.menusRepository.deleteMenu(menuIdsWillDelete);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete menu',
        error.status || 500,
      );
    }
  }

  private getAllMenuChildId(data: any[], targetId: string): string[] {
    try {
      const result: string[] = [];

      const findIds = (menus: any[]) => {
        for (const menu of menus) {
          if (menu.menuId == targetId) {
            collectIds(menu);
            result.push(targetId);
            break;
          }
          if (menu.children && menu.children.length > 0) {
            findIds(menu.children);
          }
        }
      };

      const collectIds = (menu: any) => {
        for (const child of menu.children) {
          result.push(child.menuId);
          collectIds(child);
        }
      };

      findIds(data);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete menu',
        error.status || 500,
      );
    }
  }

  async getAccessMenuByCurrentUser(
    roleId: string,
  ): Promise<{ globalFeature: Features[]; menus: Menu[] }> {
    try {
      const getAccessMenu =
        await this.menusRepository.getAccessMenuByRoleId(roleId);
      const hierarchicalMenus = await this.buildMenuHierarchy(
        getAccessMenu,
        roleId,
      );
      return {
        globalFeature: await this.featuresService.getFeatureNoMenuId(),
        menus: hierarchicalMenus,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by current user',
        error.status || 500,
      );
    }
  }

  async getAccessMenuByRoleId(roleId: string): Promise<Menu[] | []> {
    try {
      const getAccessMenu =
        await this.menusRepository.getAllMenuAccessByRoleId(roleId);
      const formatMenu = await this.buildMenuHierarchy(
        getAccessMenu,
        roleId,
        false,
      );

      return formatMenu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role',
        error.status || 500,
      );
    }
  }

  async getAllMenuToCreateAccessMenu(): Promise<Menu[] | []> {
    try {
      const menus = await this.menusRepository.getMenusToCreateAccess();
      const formatMenu = await this.buildMenuHierarchy(menus, null, false);
      return formatMenu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all menu to create access menu',
        error.status || 500,
      );
    }
  }

  async createUpdateBulkAccessMenu(
    creatBulkAccessMenuDto: CreateUpdateBulkAccessMenuDto,
  ) {
    try {
      const { roleId, createdBy, menus } = creatBulkAccessMenuDto;

      await Promise.all([
        this.userService.getUser(createdBy),
        this.roleService.getRoleById(roleId),
      ]);

      const collectIds = this.collectMenuIdToCreate(menus);
      await this.menusRepository.createBulkAccessMenu(
        roleId,
        createdBy,
        collectIds,
      );
      return await this.getAccessMenuByRoleId(roleId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create bulk access menu',
        error.status || 500,
      );
    }
  }

  async deleteAccessMenuByRoleId(roleId: string): Promise<void> {
    try {
      await this.roleService.getRoleById(roleId);
      await this.menusRepository.deleteAccessMenuTrxByRoleId(null, roleId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access menu by role',
        error.status || 500,
      );
    }
  }

  private async buildMenuHierarchy(
    menus: Menu[],
    roleId: string | null = null,
    isPrintFeature: boolean = true,
  ): Promise<Menu[]> {
    try {
      const menuMap = new Map(
        menus.map((menu) => [
          menu.menuId,
          { ...menu, features: [], children: [] },
        ]),
      );

      const rootMenus: Menu[] = [];
      for (const menu of menuMap.values()) {
        if (isPrintFeature) {
          const features = await this.buildFeatureMenu(roleId, menu.menuId);
          if (features) menu.features.push(...features);
        }

        if (menu.parentMenuId) {
          if (!menuMap.get(menu.parentMenuId)) {
            rootMenus.push(menu);
          } else {
            const parentMenu = menuMap.get(menu.parentMenuId);
            if (parentMenu) {
              parentMenu.children.push(menu);
            }
          }
        } else {
          rootMenus.push(menu);
        }
      }

      return rootMenus;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error mapping menu and features',
        error.status || 500,
      );
    }
  }

  private async buildFeatureMenu(
    roleId: string | null,
    menuId: string,
  ): Promise<Features[] | []> {
    try {
      let features: Features[] = [];

      if (!roleId) {
        features = await this.featuresService.getFeatureByMenuId(menuId);
      } else {
        features = await this.featuresService.getAccessFeatureByRoleMenuId(
          roleId,
          menuId,
        );
      }

      return features;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error build features by menu',
        error.status || 500,
      );
    }
  }

  private collectMenuIdToCreate = (menus: CreateAccessMenuDto[]) => {
    const result: string[] = [];
    for (const menu of menus) {
      if (menu.selected) {
        result.push(menu.menuId);
      }

      if (menu.children && menu.children.length > 0) {
        const childResult = this.collectMenuIdToCreate(menu.children);
        result.push(...childResult);
      }
    }

    return result;
  };
}
