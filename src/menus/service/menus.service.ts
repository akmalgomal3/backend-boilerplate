import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { MenusRepository } from '../repository/menus.repository';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { Menu } from '../entity/menus.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CreateAccessMenuDto } from '../dto/create-access-menu.dto';
import { RolesService } from 'src/roles/service/roles.service';
import { UserService } from 'src/users/services/user.service';
import { UpdateAccessMenuDto } from '../dto/update-access-menu.dto';
import { FeaturesService } from 'src/features/service/features.service';
import { Features } from 'src/features/entity/features.entity';
import { features } from 'process';
import { AccessFeature } from 'src/features/entity/access_feature.entity';
import { AccessMenu } from '../entity/access_menu.entity';

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
  ): Promise<{data: {}, metadata: {}}> {
    try {
      const skip = (page - 1) * limit;
      const [menus, totalItems] = await this.menusRepository.getMenus(
        skip,
        limit,
      );
      const totalPages = Math.ceil(totalItems / limit);
      const hierarchicalMenus = await this.buildMenuHierarchy(menus);

      return {
        data: {
          globalFeature: await this.featuresService.getFeatureNoMenuId(),
          menus: hierarchicalMenus
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

  async getAccessMenuById(accessMenuId: string) {
    try {
      const accessMenu =
        await this.menusRepository.getAccessMenuById(accessMenuId);
      if (!accessMenu) {
        throw new NotFoundException('Access menu not found');
      }

      return accessMenu;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by id',
        error.status || 500,
      );
    }
  }

  async getAccessMenuByRoleId(
    roleId: string,
  ): Promise<{data: {}, metadata: null | {}}> {
    try {
      const getAccessMenu =
        await this.menusRepository.getAccessMenuByRoleId(roleId);
      const formatMenu = await this.buildMenuHierarchy(getAccessMenu, roleId);

      return {
        data: { 
          globalFeature: await this.featuresService.getAccessFeatureNoMenuId(), 
          menus: formatMenu 
        },
        metadata: null,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role',
        error.status || 500,
      );
    }
  }

  async createAccessMenu(createAccessMenuDto: CreateAccessMenuDto) {
    try {
      const { roleId, menuId, createdBy } = createAccessMenuDto;

      await Promise.all([
        this.userService.getUser(createdBy),
        this.roleService.getRoleById(roleId),
        this.getMenuById(menuId),
      ]);

      const validateAccessMenu =
        await this.menusRepository.getAccessMenuByRoleMenuId(roleId, menuId);
      if (validateAccessMenu) {
        throw new BadRequestException('Access menu already exist');
      }

      return await this.menusRepository.createAccessMenu(createAccessMenuDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create access menu',
        error.status || 500,
      );
    }
  }

  async updateAccessMenu(
    accessMenuId: string,
    updateAccessMenuDto: UpdateAccessMenuDto,
  ) {
    try {
      const { roleId, menuId, updatedBy } = updateAccessMenuDto;

      await Promise.all([
        this.userService.getUser(updatedBy),
        this.roleService.getRoleById(roleId),
        this.getAccessMenuById(accessMenuId),
        this.getMenuById(menuId),
      ])

      return await this.menusRepository.updateAccessMenu(
        accessMenuId,
        updateAccessMenuDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create access menu',
        error.status || 500,
      );
    }
  }

  async deleteAccessMenuById(accessMenuId: string): Promise<AccessMenu> {
    try {
      await this.getAccessMenuById(accessMenuId);
      return await this.menusRepository.deleteAccessMenu(accessMenuId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access menu',
        error.status || 500,
      );
    }
  }

  private async buildMenuHierarchy(
    menus: Menu[],
    roleId: string | null = null,
  ): Promise<Menu[]> {
    try {
      const menuMap = new Map(
        menus.map((menu) => [
          menu.menuId,
          { ...menu, children: [], features: [] },
        ]),
      );

      const rootMenus: Menu[] = [];
      for (const menu of menuMap.values()) {
        const features = await this.buildFeatureMenu(roleId, menu.menuId);
        if (features) menu.features.push(...features);

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
}
