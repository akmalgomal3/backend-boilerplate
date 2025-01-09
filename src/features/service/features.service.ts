import {
  BadRequestException,
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
import { HeaderTable } from 'src/common/types/header-table.type';

@Injectable()
export class FeaturesService {
  constructor(
    private featuresRepository: FeaturesRepository,
    private menusRepository: MenusRepository,
    @Inject(forwardRef(() => MenusService))
    private menuService: MenusService,
    private usersService: UserService,
    private rolesService: RolesService,
  ) {}

  async getFeatures(
    dto: PaginationDto,
    search: string,
  ): Promise<PaginatedResponseDto<Features>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;
      const [features, totalItems] = await this.featuresRepository.getFeatures(
        skip,
        limit,
        search,
      );
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: features,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
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
      const isExist = await this.getFeatureById(featureId);
      if (!isExist) {
        throw new NotFoundException(
          ErrorMessages.features.dynamicMessage(
            ErrorMessages.features.getMessage('ERROR_UPDATE_FEATURE_NOT_FOUND'),
            { featureId: featureId },
          ),
        );
      }
      if (updateFeatureDto.featureName != null) {
        const nameAlreadyAvailable =
          await this.featuresRepository.getFeatureByName(
            updateFeatureDto.featureName,
          );

        if (nameAlreadyAvailable) {
          throw new HttpException(
            ErrorMessages.features.dynamicMessage(
              ErrorMessages.features.getMessage(
                'ERROR_UPDATE_FEATURE_ALREADY_AVAILABLE',
              ),
              { featureName: updateFeatureDto.featureName },
            ),
            HttpStatus.CONFLICT,
          );
        }
      }

      if (updateFeatureDto.menuId != null) {
        const isMenuExist = await this.menusRepository.getMenuById(
          updateFeatureDto.menuId,
        );

        if (!isMenuExist) {
          throw new NotFoundException(
            ErrorMessages.features.dynamicMessage(
              ErrorMessages.features.getMessage(
                'ERROR_UPDATE_FEATURE_MENU_NOT_EXIST',
              ),
              { menuId: updateFeatureDto.menuId },
            ),
          );
        }
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
  
  getHeaderAccessFeature(){
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
  
}
