import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { ErrorMessages } from '../../common/exceptions/root-error.message';
import { FormInfo } from '../../common/types/form-info.type';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class MenusService {
  constructor(
    private menusRepository: MenusRepository,
    @Inject(forwardRef(() => FeaturesService))
    private featuresService: FeaturesService,
    private roleService: RolesService,
    private userService: UserService,
  ) {}

  async getMenus(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ data: { globalFeatures: Features[]; menus: Menu[] } }> {
    try {
      const skip = (page - 1) * limit;
      const [menus] = await this.menusRepository.getMenus(skip, limit, search);
      const hierarchicalMenus = await this.buildMenuHierarchy(menus, null);

      return {
        data: {
          globalFeatures: await this.featuresService.getFeatureNoMenuId(),
          menus: hierarchicalMenus,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.menus.getMessage('ERROR_GET_ALL_MENU'),
        error.status || 500,
      );
    }
  }

  async getRolesNonHierarchy(
    dto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 10, filters, sorts, search } = dto;
      const skip = (page - 1) * limit;

      const filterConditions =
        filters.length > 0
          ? filters.map((filter) => ({
              key: filter.key,
              value: filter.value,
              start: filter.start,
              end: filter.end,
            }))
          : [];
      const sortConditions =
        sorts.length > 0
          ? sorts.map((sort) => ({
              key: sort.key,
              direction: sort.direction,
            }))
          : [];
      const searchQuery =
        search.length > 0
          ? {
              query: search[0].query,
              searchBy: search[0].searchBy,
            }
          : null;
      const [data, totalItems] =
        await this.menusRepository.getMenusNonHierarchy(
          skip,
          limit,
          filterConditions,
          sortConditions,
          searchQuery,
        );
      const totalPages = Math.ceil(totalItems / limit);

      const mappedData = data.map((menu) => {
        if (menu.menus && menu.parentMenuId) {
          const parentMenu = menu.menus.find(
            (subMenu) => subMenu.menuId === menu.parentMenuId,
          );
          if (parentMenu) {
            menu.parentMenuId = parentMenu.menuName;
          }
        }
        delete menu.menus;
        return menu;
      });

      return {
        data: mappedData,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      };
    } catch (e) {
      throw e;
    }
  }

  async getMenuById(menuId: string): Promise<Menu> {
    try {
      const menu = await this.menusRepository.getMenuById(menuId);

      if (!menu) {
        throw new NotFoundException(
          ErrorMessages.menus.dynamicMessage(
            ErrorMessages.menus.getMessage('ERROR_GET_MENU_BY_ID_NOT_FOUND'),
            { menuId: menuId },
          ),
        );
      }

      return menu;
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.menus.getMessage('ERROR_GET_MENU_BY_ID'),
        error.status || 500,
      );
    }
  }

  async getMenuByName(menuName: string): Promise<Menu> {
    try {
      const menu = await this.menusRepository.getMenuByName(menuName);

      if (!menu) {
        throw new NotFoundException(
          ErrorMessages.menus.dynamicMessage(
            ErrorMessages.menus.getMessage('ERROR_GET_MENU_BY_NAME_NOT_FOUND'),
            { menuName: menuName },
          ),
        );
      }

      return menu;
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.menus.getMessage('ERROR_GET_MENU_BY_NAME'),
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

        if (isParentExist == null) {
          throw new NotFoundException(
            ErrorMessages.menus.dynamicMessage(
              ErrorMessages.menus.getMessage(
                'ERROR_CREATE_MENU_PARENT_NOT_FOUND',
              ),
              { menuId: createMenuDto.parentMenuId },
            ),
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
        error.message || ErrorMessages.menus.getMessage('ERROR_CREATE_MENU'),
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
        throw new NotFoundException(
          ErrorMessages.menus.dynamicMessage(
            ErrorMessages.menus.getMessage('ERROR_UPDATE_MENU_NOT_FOUND'),
            { menuId: menuId },
          ),
        );
      }

      if (updateMenuDto.parentMenuId != null) {
        const isParentExist = await this.menusRepository.getMenuById(
          updateMenuDto.parentMenuId,
        );

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
        await this.validateCircularDependency(
          updateMenuDto.parentMenuId,
          menuId,
        );
      }

      await this.menusRepository.updateMenu(menuId, updateMenuDto, userId);
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.menus.getMessage('ERROR_UPDATE_MENU'),
        error.status || 500,
      );
    }
  }

  async bulkUpdateMenu(
    updates: { menuId: string; updateMenuDto: UpdateMenuDto }[],
    userId: string,
  ) {
    try {
      await this.menusRepository.bulkUpdateMenu(updates, userId);
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.menus.getMessage('ERROR_BULK_UPDATE_MENU'),
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
        error.message || ErrorMessages.menus.getMessage('ERROR_DELETE_MENU'),
        error.status || 500,
      );
    }
  }

  async bulkDeleteMenu(menuIds: { menuId: string }[]) {
    try {
      for (const { menuId } of menuIds) {
        await this.getMenuById(menuId);
      }

      const allMenus = await this.getMenus(1, 100000);

      const menuIdsWillDelete = new Set<string>();
      for (const { menuId } of menuIds) {
        const childIds = this.getAllMenuChildId(allMenus.data['menus'], menuId);
        childIds.forEach((id) => menuIdsWillDelete.add(id));
      }

      await this.menusRepository.deleteMenu(Array.from(menuIdsWillDelete));
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.menus.getMessage('ERROR_DELETE_MENU'),
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
        error.message ||
          ErrorMessages.menus.getMessage('ERROR_GET_ALL_MENU_CHILD_ID'),
        error.status || 500,
      );
    }
  }

  async getAccessMenuByCurrentUser(
    roleId: string,
  ): Promise<{ globalFeatures: Features[]; menus: Menu[] }> {
    try {
      const getAccessMenu =
        await this.menusRepository.getAccessMenuByRoleId(roleId);
      const hierarchicalMenus = await this.buildMenuHierarchy(
        getAccessMenu,
        roleId,
        true,
        true,
      );
      return {
        globalFeatures:
          await this.featuresService.getAccessFeatureNoMenuId(roleId),
        menus: hierarchicalMenus,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by current user',
        error.status || 500,
      );
    }
  }

  async getAccessMenuByRoleIdToCreateAccessFeature(
    roleId: string,
  ): Promise<{ globalFeatures: Features[]; menus: Menu[] }> {
    try {
      const getAccessMenu =
        await this.menusRepository.getAccessMenuByRoleId(roleId);
      const hierarchicalMenus = await this.buildMenuHierarchy(
        getAccessMenu,
        roleId,
        true,
        false,
      );
      return {
        globalFeatures:
          await this.featuresService.getAllFeatureNoMenuIdAccessByRoleId(
            roleId,
          ),
        menus: hierarchicalMenus,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu with features by role',
        error.status || 500,
      );
    }
  }

  async getAllMenuToCreateAccessMenu(roleId: string): Promise<Menu[] | []> {
    try {
      const menus = await this.menusRepository.getAllMenuAccessByRoleId(roleId);
      const formatMenu = await this.buildMenuHierarchy(menus, null);
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

      return await this.getAllMenuToCreateAccessMenu(roleId);
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
    isPrintFeature: boolean = false,
    isAccessFeature: boolean = false,
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
          const features = await this.buildFeatureMenu(
            roleId,
            menu.menuId,
            isAccessFeature,
          );
          if (features) menu.features.push(...features);
        }

        if (menu.parentMenuId) {
          if (!menuMap.get(menu.parentMenuId)) {
            rootMenus.push(menu);
          } else {
            const parentMenu = menuMap.get(menu.parentMenuId);
            if (menu.menuName == 'Menu 23') {
              console.log('23 was here ', parentMenu);
            }
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
        error.message ||
          ErrorMessages.menus.getMessage('ERROR_BUILD_MENU_HIERARCHY'),
        error.status || 500,
      );
    }
  }

  async buildFeatureMenu(
    roleId: string | null,
    menuId: string,
    isAccessFeature: boolean = false,
  ): Promise<Features[] | []> {
    try {
      let features: Features[] = [];

      if (roleId && isAccessFeature) {
        features = await this.featuresService.getAccessFeatureByRoleMenuId(
          roleId,
          menuId,
        );
      } else {
        features = await this.featuresService.getAllFeatureAccessByMenuRoleId(
          menuId,
          roleId,
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

  async getMenuHeader() {
    try {
      return [
        {
          key: 'menuName',
          label: 'Menu Name',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'text',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'parentMenuId',
          label: 'Parent Menu',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: true,
          type: 'select',
          option: {
            type: 'suggestion',
            value: '/options/data/menus/menu_name?pkName=menu_id&search=',
          },
          inlineEdit: false,
        },
        {
          key: 'routePath',
          label: 'Route Path',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'text',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'icon',
          label: 'Icon',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'text',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'hierarchyLevel',
          label: 'Hierarchy Level',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'number',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'description',
          label: 'Description',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'textarea',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'active',
          label: 'Active',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'boolean',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'createdAt',
          label: 'Created At',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: false,
          type: 'datetime',
          option: {},
          inlineEdit: false,
        },
        {
          key: 'updatedAt',
          label: 'Last Updated',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: false,
          type: 'datetime',
          option: {},
          inlineEdit: false,
        },
      ];
    } catch (e) {
      throw new HttpException(
        e.message ||
          ErrorMessages.menus.getMessage('ERROR_GETTING_MENU_HEADER'),
        e.status || 500,
      );
    }
  }

  async formCreateUpdateMenu(menuId: string = null): Promise<FormInfo> {
    const formInfo: FormInfo = {
      id: null,
      title: `Create Menu`,
      description: `Create Menu`,
      fields: [
        {
          type: 'text',
          key: 'menuId',
          label: 'Menu Id',
          value: null,
          required: true,
          placeholder: '',
          option: {},
          visible: false,
          disable: true,
          prefix: '',
          suffix: '',
        },
        {
          type: 'text',
          key: 'menuName',
          label: 'Menu Name',
          value: null,
          required: true,
          placeholder: 'input menu name',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'select',
          key: 'parentMenuId',
          label: 'Parent Menu',
          value: null,
          required: true,
          placeholder: 'Input Parent Menu',
          option: {
            type: 'suggestion',
            value: '/options/data/menus/menu_name?pkName=menu_id&search=',
          },
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'text',
          key: 'routePath',
          label: 'Route Path',
          value: null,
          required: true,
          placeholder: 'input route path',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'text',
          key: 'icon',
          label: 'Icon',
          value: null,
          required: true,
          placeholder: 'input icon',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'number',
          key: 'hierarchyLevel',
          label: 'Hierarchy Level',
          value: null,
          required: true,
          placeholder: 'input hierarchy level',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'textarea',
          key: 'description',
          label: 'Description',
          value: null,
          required: true,
          placeholder: 'input menu description',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'boolean',
          key: 'active',
          label: 'Active',
          value: null,
          required: true,
          placeholder: 'input menu active',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
      ],
    };

    if (menuId) {
      formInfo.title = 'Update Menu';
      formInfo.description = 'Update Menu';
      formInfo.id = menuId;

      const menu = await this.getMenuById(menuId);
      for (const field of formInfo.fields) {
        field.value = menu[field.key];
      }
    }

    return formInfo;
  }

  private async validateCircularDependency(
    parentMenuId: string,
    currentMenuId: string,
  ): Promise<void> {
    let parent = await this.menusRepository.getMenuById(parentMenuId);

    while (parent) {
      if (parent.menuId === currentMenuId) {
        throw new BadRequestException(
          ErrorMessages.menus.dynamicMessage(
            ErrorMessages.menus.getMessage('ERROR_CIRCULAR_DEPENDENCY'),
            { currentMenuId: currentMenuId },
          ),
        );
      }
      parent = parent.parentMenuId
        ? await this.menusRepository.getMenuById(parent.parentMenuId)
        : null;
    }
  }
}
