import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FeaturesRepository } from '../repository/features.repository';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { MenusRepository } from '../../menus/repository/menus.repository';

@Injectable()
export class FeaturesService {
  constructor(
    private featuresRepository: FeaturesRepository,
    private menusRepository: MenusRepository,
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
          `Feature with name ${createFeatureDto.featureName} already available!`,
          HttpStatus.CONFLICT,
        );
      }

      const isMenuExist = await this.menusRepository.getMenuById(
        createFeatureDto.menuId,
      );

      if (!isMenuExist) {
        throw new NotFoundException(
          `Menu with id ${createFeatureDto.menuId} not exist!`,
        );
      }

      const newFeature = await this.featuresRepository.createFeature(
        {
          ...createFeatureDto,
          active: createFeatureDto.active ?? true,
        },
        userId,
      );
      return newFeature;
    } catch (error) {
      throw error;
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
        throw new NotFoundException(`Feature with id ${featureId} not exist!`);
      }
      if (updateFeatureDto.featureName != null) {
        const nameAlreadyAvailable =
          await this.featuresRepository.getFeatureByName(
            updateFeatureDto.featureName,
          );

        if (nameAlreadyAvailable) {
          throw new HttpException(
            `Feature with name ${updateFeatureDto.featureName} already available!`,
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
            `Menu with id ${updateFeatureDto.menuId} not exist!`,
          );
        }
      }

      await this.featuresRepository.updateFeature(
        featureId,
        updateFeatureDto,
        userId,
      );
    } catch (error) {
      throw error;
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
}
