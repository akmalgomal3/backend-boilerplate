import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { FeaturesRepository } from '../repository/features.repository';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CreateAccessFeatureDto } from '../dto/create-access-feature.dto';
import { AccessFeature } from '../entity/access_feature.entity';
import { UserService } from 'src/users/services/user.service';
import { RolesService } from 'src/roles/service/roles.service';
import { UpdateAccessFeatureDto } from '../dto/update-access-feature.dto';
import { Feature } from 'typeorm';

@Injectable()
export class FeaturesService {
  constructor(
    private featuresRepository: FeaturesRepository,
    private usersService: UserService,
    private rolesService: RolesService,
  ) {}

  async getFeatures(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<Features>> {
    try {
      const skip = (page - 1) * limit;
      const [features, totalItems] = await this.featuresRepository.getFeatures(
        skip,
        limit,
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
      throw new ConflictException('Failed to retrieve features', error);
    }
  }

  async getFeatureById(featureId: string): Promise<Features> {
    try {
      const feature = await this.featuresRepository.getFeatureById(featureId);

      if (!feature) {
        throw new NotFoundException(`Feature with ID ${featureId} not found`);
      }

      return feature;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to retrieve feature');
    }
  }

  async getFeatureByName(featureName: string): Promise<Features> {
    try {
      const feature =
        await this.featuresRepository.getFeatureByName(featureName);

      if (!feature) {
        throw new NotFoundException(
          `Feature with name ${featureName} not found`,
        );
      }

      return feature;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to retrieve feature');
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
      const newFeature = await this.featuresRepository.createFeature(
        {
          ...createFeatureDto,
          active: createFeatureDto.active ?? true,
        },
        userId,
      );
      return newFeature;
    } catch (error) {
      throw new ConflictException('Failed to create feature', error);
    }
  }

  async updateFeature(
    featureId: string,
    updateFeatureDto: UpdateFeatureDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.getFeatureById(featureId);

      await this.featuresRepository.updateFeature(
        featureId,
        updateFeatureDto,
        userId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to update feature');
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    try {
      await this.getFeatureById(featureId);

      await this.featuresRepository.deleteFeature(featureId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to delete feature');
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
      if (validateAccessFeature) {
        throw new BadRequestException('Access feature already exist');
      }

      return await this.featuresRepository.createAccessFeature(
        createAccessFeatureDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access menu by role',
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

  async deleteAccessFeatureById(accessFeatureId: string): Promise<AccessFeature> {
    try {
      await this.getAccessFeatureById(accessFeatureId);
      return await this.featuresRepository.deleteAccessMenuFeature(accessFeatureId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access menu by id',
        error.status || 500,
      );
    }
  }
}
