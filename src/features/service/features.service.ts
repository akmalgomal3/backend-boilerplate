import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeaturesRepository } from '../repository/features.repository';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import {
  CreateUpdateAccessFeatureByMenuDto,
  CreateUpdateAccessFeatureDto,
  CreateUpdateBulkAccessFeatureDto,
} from '../dto/create-update-access-feature.dto';
import { UserService } from 'src/users/services/user.service';
import { RolesService } from 'src/roles/service/roles.service';
import { MenusRepository } from '../../menus/repository/menus.repository';
import { MenusService } from 'src/menus/service/menus.service';
import { Menu } from 'src/menus/entity/menus.entity';
import { ErrorMessages } from '../../common/exceptions/root-error.message';
import { HeaderTable } from '../../common/types/header-table.type';
import { FormInfo } from '../../common/types/form-info.type';
import { UtilsService } from '../../libs/utils/services/utils.service';

@Injectable()
export class FeaturesService {
  constructor(
    private featuresRepository: FeaturesRepository,
    private menusRepository: MenusRepository,
    @Inject(forwardRef(() => MenusService))
    private menuService: MenusService,
    private usersService: UserService,
    private rolesService: RolesService,
    private utilsService: UtilsService,
  ) {}

  async getFeatures(
    dto: PaginationDto,
  ): Promise<PaginatedResponseDto<Features>> {
    try {
      const { page = 1, limit = 10, filters, sorts, search } = dto;
      const skip = (page - 1) * limit;

      const filterConditions = this.utilsService.buildFilterConditions(filters);
      const sortConditions = this.utilsService.buildSortConditions(sorts);
      const searchQuery = this.utilsService.buildSearchQuery(search);

      const [data, totalItems] = await this.featuresRepository.getFeatures(
        skip,
        limit,
        filterConditions,
        sortConditions,
        searchQuery,
      );

      const mappedData = data.map((feature) => {
        if (feature['menu'] && feature.menuId) {
          const menu = feature['menu'].find(
            (subMenu) => subMenu.menuId === feature.menuId,
          );
          if (menu) {
            feature.menuId = menu.menuName;
          }
        }
        delete feature['menu'];
        return feature;
      });

      return {
        data: mappedData,
        metadata: this.utilsService.calculatePagination(
          totalItems,
          limit,
          page,
        ),
      };
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_GET_FEATURES'),
        error.status || 500,
      );
    }
  }

  async getFeatureById(featureId: string): Promise<Features> {
    try {
      const feature = await this.featuresRepository.getFeatureById(featureId);

      if (!feature) {
        throw new NotFoundException(
          ErrorMessages.features.dynamicMessage(
            ErrorMessages.features.getMessage(
              'ERROR_GET_FEATURE_BY_ID_NOT_FOUND',
            ),
            { featureId: featureId },
          ),
        );
      }

      return feature;
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_GET_FEATURES_BY_ID'),
        error.status || 500,
      );
    }
  }

  async getFeatureByName(featureName: string): Promise<Features> {
    try {
      const feature =
        await this.featuresRepository.getFeatureByName(featureName);

      if (!feature) {
        throw new NotFoundException(
          ErrorMessages.features.dynamicMessage(
            ErrorMessages.features.getMessage(
              'ERROR_GET_FEATURE_BY_NAME_NOT_FOUND',
            ),
            { featureName: featureName },
          ),
        );
      }

      return feature;
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_GET_FEATURES_BY_NAME'),
        error.status || 500,
      );
    }
  }

  async getFeatureNoMenuId(): Promise<Features[]> {
    try {
      return await this.featuresRepository.getFeatureNoMenuId();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get feature by menu id',
        error.status || 500,
      );
    }
  }

  async getFeatureByMenuId(menuId: string): Promise<Features[]> {
    try {
      return await this.featuresRepository.getFeatureByMenuId(menuId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get feature by menu id',
        error.status || 500,
      );
    }
  }

  async createFeature(
    createFeatureDto: CreateFeatureDto,
    userId: string,
  ): Promise<string> {
    try {
      const isAlreadyAvailable = await this.featuresRepository.getFeatureByName(
        createFeatureDto.featureName,
      );

      if (isAlreadyAvailable) {
        throw new HttpException(
          ErrorMessages.features.dynamicMessage(
            ErrorMessages.features.getMessage(
              'ERROR_CREATE_FEATURE_ALREADY_AVAILABLE',
            ),
            { featureName: createFeatureDto.featureName },
          ),
          HttpStatus.CONFLICT,
        );
      }

      if (createFeatureDto.menuId != null) {
        const isMenuExist = await this.menusRepository.getMenuById(
          createFeatureDto.menuId,
        );

        if (!isMenuExist) {
          throw new NotFoundException(
            ErrorMessages.features.dynamicMessage(
              ErrorMessages.features.getMessage(
                'ERROR_CREATE_FEATURE_MENU_NOT_EXIST',
              ),
              { menuId: createFeatureDto.menuId },
            ),
          );
        }
      }

      return await this.featuresRepository.createFeature(
        {
          ...createFeatureDto,
          active: createFeatureDto.active ?? true,
        },
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_CREATE_FEATURE'),
        error.status || 500,
      );
    }
  }

  async updateFeature(
    featureId: string,
    updateFeatureDto: UpdateFeatureDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.validateFeatureExist(featureId);
      if (updateFeatureDto.featureName != null) {
        await this.validateFeatureNameUnique(updateFeatureDto.featureName);
      }
      if (updateFeatureDto.menuId != null) {
        await this.validateMenuExist(updateFeatureDto.menuId);
      }

      await this.featuresRepository.updateFeature(
        featureId,
        updateFeatureDto,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_UPDATE_FEATURE'),
        error.status || 500,
      );
    }
  }

  async bulkUpdateFeature(
    updates: { featureId: string; updateFeatureDto: UpdateFeatureDto }[],
    userId: string,
  ): Promise<void> {
    try {
      for (const { featureId, updateFeatureDto } of updates) {
        await this.validateFeatureExist(featureId);
        if (updateFeatureDto.featureName != null) {
          await this.validateFeatureNameUnique(updateFeatureDto.featureName);
          if (updateFeatureDto.menuId != null) {
            await this.validateMenuExist(updateFeatureDto.menuId);
          }
        }
      }
      await this.featuresRepository.bulkUpdateFeature(updates, userId);
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_BULK_UPDATE_FEATURE'),
        error.status || 500,
      );
    }
  }

  async validateFeatureExist(featureId: string): Promise<void> {
    const isExist = await this.getFeatureById(featureId);
    if (!isExist) {
      throw new NotFoundException(
        ErrorMessages.features.dynamicMessage(
          ErrorMessages.features.getMessage('ERROR_UPDATE_FEATURE_NOT_FOUND'),
          { featureId },
        ),
      );
    }
  }

  async validateFeatureNameUnique(featureName: string): Promise<void> {
    const nameAlreadyAvailable =
      await this.featuresRepository.getFeatureByName(featureName);
    if (nameAlreadyAvailable) {
      throw new HttpException(
        ErrorMessages.features.dynamicMessage(
          ErrorMessages.features.getMessage(
            'ERROR_UPDATE_FEATURE_ALREADY_AVAILABLE',
          ),
          { featureName },
        ),
        HttpStatus.CONFLICT,
      );
    }
  }

  async validateMenuExist(menuId: string): Promise<void> {
    const isMenuExist = await this.menusRepository.getMenuById(menuId);
    if (!isMenuExist) {
      throw new NotFoundException(
        ErrorMessages.features.dynamicMessage(
          ErrorMessages.features.getMessage(
            'ERROR_UPDATE_FEATURE_MENU_NOT_EXIST',
          ),
          { menuId },
        ),
      );
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    try {
      await this.getFeatureById(featureId);

      await this.featuresRepository.deleteFeature(featureId);
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_DELETE_FEATURE'),
        error.status || 500,
      );
    }
  }

  async bulkDeleteFeature(featureIds: string[]): Promise<void> {
    try {
      for (const featureId of featureIds) {
        await this.getFeatureById(featureId);
      }
      await this.featuresRepository.bulkDeleteFeature(featureIds);
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.features.getMessage('ERROR_BULK_DELETE_FEATURE'),
        error.status || 500,
      );
    }
  }

  async getAllFeaturesToCreateAccessFeature(
    roleId: string,
  ): Promise<{ globalFeatures: Features[]; menus: Menu[] }> {
    try {
      return await this.menuService.getAccessMenuByRoleIdToCreateAccessFeature(
        roleId,
      );
    } catch (error) {
      throw new HttpException(
        error.message ||
          'Error get all menu by features to create access feature',
        error.status || 500,
      );
    }
  }

  async getAccessFeatureNoMenuId(roleId: string): Promise<Features[]> {
    try {
      return await this.featuresRepository.getAccessFeatureNoMenuId(roleId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access feature no menu id',
        error.status || 500,
      );
    }
  }

  async getAccessFeatureByRoleMenuId(
    roleId: string,
    menuId: string,
  ): Promise<Features[]> {
    try {
      return await this.featuresRepository.getAccessFeatureByRoleMenuId(
        roleId,
        menuId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role',
        error.status || 500,
      );
    }
  }

  async getAllFeatureNoMenuIdAccessByRoleId(
    roleId: string,
  ): Promise<Features[]> {
    try {
      return await this.featuresRepository.getAllFeatureNoMenuIdAccessByRoleId(
        roleId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all access feature menu by role id',
        error.status || 500,
      );
    }
  }

  async getAllFeatureAccessByMenuRoleId(
    menuId: string,
    roleId: string,
  ): Promise<Features[]> {
    try {
      return await this.featuresRepository.getAllFeatureAccessByMenuRoleId(
        menuId,
        roleId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all access feature menu by role id',
        error.status || 500,
      );
    }
  }

  async bulkCreateUpdateAccessFeature(
    createBulkAccessFeatureDto: CreateUpdateBulkAccessFeatureDto,
  ): Promise<{ globalFeatures: Features[]; menus: Menu[] }> {
    try {
      const { roleId, createdBy, globalFeatures, menus } =
        createBulkAccessFeatureDto;

      await Promise.all([
        this.usersService.getUser(createdBy),
        this.rolesService.getRoleById(roleId),
      ]);

      const collectFeatures = this.collectFeatures(menus, globalFeatures);
      await this.featuresRepository.createBulkAccessFeature(
        roleId,
        createdBy,
        collectFeatures,
      );

      return await this.menuService.getAccessMenuByRoleIdToCreateAccessFeature(
        roleId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create access menu by role',
        error.status || 500,
      );
    }
  }

  async deleteAccessFeatureByRoleId(roleId: string): Promise<void> {
    try {
      await this.featuresRepository.deleteAccessFeatureByRoleId(null, roleId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access feature by role id',
        error.status || 500,
      );
    }
  }
  
  getAccessFeatureHeader(){
    return [
      {
        key: 'menuName',
        label: 'Menu Name',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'featureName',
        label: 'feature Name',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'active',
        label: 'active',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'canAccess',
        label: 'canAccess',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: true,
      },
      {
        key: 'canRead',
        label: 'canRead',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: true,
      },
      {
        key: 'canInsert',
        label: 'canInsert',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: true,
      },
      {
        key: 'canUpdate',
        label: 'canUpdate',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: true,
      },
      {
        key: 'canDelete',
        label: 'canDelete',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {},
        inlineEdit: true,
      },
    ]
  }

  private collectFeatures(
    menusWithFeature: CreateUpdateAccessFeatureByMenuDto[],
    globalFeatures: CreateUpdateAccessFeatureDto[] = [],
  ): CreateUpdateAccessFeatureDto[] {
    const collect: CreateUpdateAccessFeatureDto[] = [];

    menusWithFeature.forEach((menu) => {
      if (menu.children.length > 0) {
        const features = this.collectFeatures(menu.children);
        collect.push(...features);
      }

      menu.features.forEach((feature) => {
        if (
          feature.canAccess ||
          feature.canRead ||
          feature.canUpdate ||
          feature.canDelete ||
          feature.canInsert
        ) {
          collect.push(feature);
        }
      });
    });

    globalFeatures.forEach((feature) => {
      if (
        feature.canAccess ||
        feature.canRead ||
        feature.canUpdate ||
        feature.canDelete ||
        feature.canInsert
      ) {
        collect.push(feature);
      }
    });

    return collect;
  }

  async getFeatureHeader(): Promise<HeaderTable[]> {
    try {
      return [
        {
          key: 'featureName',
          label: 'Feature Name',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'text',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'menuId',
          label: 'Menu Name',
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
          key: 'description',
          label: 'Description',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: false,
          type: 'text',
          option: {},
          inlineEdit: false,
        },
        {
          key: 'active',
          label: 'Active',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'radio',
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
          ErrorMessages.roles.getMessage('ERROR_GETTING_ROLE_HEADER'),
        e.status || 500,
      );
    }
  }

  async formCreateUpdateFeature(featureId: string = null): Promise<FormInfo> {
    const formInfo: FormInfo = {
      id: null,
      title: `Create Feature`,
      description: `Create Feature`,
      fields: [
        {
          type: 'text',
          key: 'featureId',
          label: 'Feature Id',
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
          key: 'featureName',
          label: 'Feature Name',
          value: null,
          required: true,
          placeholder: 'input Feature name',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'select',
          key: 'menuId',
          label: 'Menu Name',
          value: null,
          required: true,
          placeholder: 'Input Feature Menu',
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
          key: 'description',
          label: 'Feature Description',
          value: null,
          required: true,
          placeholder: 'input Feature Description',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
        {
          type: 'Active',
          key: 'active',
          label: 'Active',
          value: null,
          required: true,
          placeholder: 'input active',
          option: {},
          visible: true,
          disable: false,
          prefix: '',
          suffix: '',
        },
      ],
    };

    if (featureId) {
      formInfo.title = 'Update Feature';
      formInfo.description = 'Update Feature';
      formInfo.id = featureId;

      const menu = await this.getFeatureById(featureId);
      for (const field of formInfo.fields) {
        field.value = menu[field.key];
      }
    }

    return formInfo;
  }
}
