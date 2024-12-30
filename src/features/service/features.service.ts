import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { CreateAccessFeatureDto } from '../dto/create-access-feature.dto';
import { AccessFeature } from '../entity/access_feature.entity';
import { UserService } from 'src/users/services/user.service';
import { RolesService } from 'src/roles/service/roles.service';
import { UpdateAccessFeatureDto } from '../dto/update-access-feature.dto';
import { MenusRepository } from '../../menus/repository/menus.repository';
import { ErrorMessages } from '../../common/exceptions/root-error.message';

@Injectable()
export class FeaturesService {
  constructor(
    private featuresRepository: FeaturesRepository,
    private menusRepository: MenusRepository,
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

  async createAccessFeature(
    createAccessFeatureDto: CreateAccessFeatureDto,
  ): Promise<AccessFeature> {
    try {
      const { roleId, featureId, createdBy } = createAccessFeatureDto;

      await Promise.all([
        this.usersService.getUser(createdBy),
        this.rolesService.getRoleById(roleId),
        this.getFeatureById(featureId),
      ]);

      const validateAccessFeature =
        await this.featuresRepository.getAccessFeatureByRoleFeatureId(
          roleId,
          featureId,
        );
      console.log('masuk create access feature');

      if (validateAccessFeature) {
        new BadRequestException('Access feature already exist');
      }

      return await this.featuresRepository.createAccessFeature(
        createAccessFeatureDto,
      );
    } catch (error) {
      new HttpException(
        error.message || 'Error get access menu by role',
        error.status || 500,
      );
    }
  }

  async getAccessFeatureNoMenuId(): Promise<Features[]> {
    try {
      return await this.featuresRepository.getAccessFeatureNoMenuId();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access feature no menu id',
        error.status || 500,
      );
    }
  }

  async getAccessFeatureById(accessFeatureId: string) {
    try {
      const accessFeature =
        await this.featuresRepository.getAccessFeatureById(accessFeatureId);
      if (!accessFeature) {
        throw new NotFoundException('Access menu not found');
      }

      return accessFeature;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role',
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

  async updateAccessFeatureById(
    accessFeatureId: string,
    updateAccessFeatureDto: UpdateAccessFeatureDto,
  ): Promise<AccessFeature> {
    try {
      const { roleId, featureId, updatedBy } = updateAccessFeatureDto;

      await Promise.all([
        this.usersService.getUser(updatedBy),
        this.rolesService.getRoleById(roleId),
        this.getFeatureById(featureId),
        this.getAccessFeatureById(accessFeatureId),
      ]);

      return await this.featuresRepository.updateAccessFeatureById(
        accessFeatureId,
        updateAccessFeatureDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error update access menu by id',
        error.status || 500,
      );
    }
  }

  async deleteAccessFeatureById(
    accessFeatureId: string,
  ): Promise<AccessFeature> {
    try {
      await this.getAccessFeatureById(accessFeatureId);
      return await this.featuresRepository.deleteAccessMenuFeature(
        accessFeatureId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access menu by id',
        error.status || 500,
      );
    }
  }
}
