import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  DataSource,
  ILike, In,
  IsNull,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { CreateUpdateAccessFeatureDto } from '../dto/create-update-access-feature.dto';
import { AccessFeature } from '../entity/access_feature.entity';
import { AccessFeatureQuery } from '../query/access_feature.query';
import { UtilsService } from '../../libs/utils/services/utils.service';

@Injectable()
export class FeaturesRepository {
  private repository: Repository<Features>;
  private accessFeatureRepository: Repository<AccessFeature>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
    private utilsService: UtilsService,
  ) {
    this.repository = this.dataSource.getRepository(Features);
    this.accessFeatureRepository = this.dataSource.getRepository(AccessFeature);
  }

  async getFeatures(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[Features[], number]> {
    try {
      return await this.utilsService.getAllQuery(
        skip,
        take,
        filters,
        sorts,
        searchQuery,
        'features',
        this.repository,
        [
          {
            table: 'menus',
            alias: 'menu',
            condition: 'features.menu_id = menu.menu_id',
          },
        ],
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all features',
        error.status || 500,
      );
    }
  }

  async getFeatureById(featureId: string): Promise<Features | null> {
    try {
      const feature = await this.repository.findOne({
        where: { featureId },
      });

      return feature || null;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get feature by feature id',
        error.status || 500,
      );
    }
  }

  async getFeatureByName(featureName: string): Promise<Features | null> {
    try {
      const feature = await this.repository.findOne({
        where: { featureName: ILike(featureName) },
      });

      return feature || null;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get feature by feature name',
        error.status || 500,
      );
    }
  }

  async getFeatureNoMenuId(): Promise<Features[]> {
    try {
      const getFeatureNoMenuId = await this.repository.find({
        where: { menuId: IsNull() },
      });
      return getFeatureNoMenuId;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get features no menu id',
        error.status || 500,
      );
    }
  }

  async getFeatureByMenuId(menuId: string): Promise<Features[]> {
    try {
      const getFeatureByMenuId = await this.repository.find({
        where: { menuId },
      });

      return getFeatureByMenuId;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get features by menu id',
        error.status || 500,
      );
    }
  }

  async createFeature(dto: CreateFeatureDto, userId: string): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newFeature = this.repository.create({
        featureName: dto.featureName,
        menuId: dto.menuId || null,
        description: dto.description || null,
        active: dto.active ?? true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedFeature = await queryRunner.manager.save(newFeature);

      await queryRunner.commitTransaction();
      return savedFeature.featureId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error create feature',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateFeature(
    featureId: string,
    dto: UpdateFeatureDto,
    userId: string,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateData = {
        featureName: dto.featureName || undefined,
        menuId: dto.menuId || undefined,
        description: dto.description || undefined,
        active: dto.active ?? undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      };

      await queryRunner.manager.update(Features, { featureId }, updateData);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error update feature by feature id',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdateFeature(
    updates: { featureId: string; updateFeatureDto: UpdateFeatureDto }[],
    userId: string,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { featureId, updateFeatureDto } of updates) {
        const updateData = {
          featureName: updateFeatureDto.featureName || undefined,
          menuId: updateFeatureDto.menuId || undefined,
          description: updateFeatureDto.description || undefined,
          active: updateFeatureDto.active ?? undefined,
          updatedBy: userId,
          updatedAt: new Date(),
        };

        await queryRunner.manager.update(Features, { featureId }, updateData);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error bulk update feature',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Features, { featureId });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error delete feature by feature id',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async bulkDeleteFeature(featureIds: string[]): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Features, {
        featureId: In(featureIds),
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error bulk delete feature by feature id',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAccessFeatureNoMenuId(roleId: string): Promise<Features[]> {
    try {
      const query = AccessFeatureQuery.GET_ACCESS_FEATURE_NO_MENU_ID(roleId);
      const features = await this.repository.query(query);
      return features;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access features no menu id',
        error.status || 500,
      );
    }
  }

  async getAccessFeatureByRoleMenuId(
    roleId: string,
    menuId: string,
  ): Promise<Features[]> {
    try {
      const getAccessFeature = await this.repository.find({
        // relations: ['accessFeature'],
        where: {
          menuId,
          active: true,
          accessFeature: {
            role: { roleId },
          },
        },
      });

      return getAccessFeature;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get access features by role menu id',
        error.status || 500,
      );
    }
  }

  async getAllFeatureNoMenuIdAccessByRoleId(
    roleId: string,
  ): Promise<Features[]> {
    try {
      const query =
        AccessFeatureQuery.GET_ALL_FEATURE_NO_MENU_ID_ACCESS_BY_ROLE_ID(roleId);
      const result = await this.repository.query(query);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all features no menu id access by role id',
        error.status || 500,
      );
    }
  }

  async getAllFeatureAccessByMenuRoleId(
    menuId: string,
    roleId: string,
  ): Promise<Features[]> {
    try {
      const query = AccessFeatureQuery.GET_ALL_FEATURE_ACCESS_BY_MENU_ROLE_ID(
        menuId,
        roleId,
      );
      const result = await this.repository.query(query);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get all features access by menu role id',
        error.status || 500,
      );
    }
  }

  async createBulkAccessFeature(
    roleId: string,
    createdBy: string,
    features: CreateUpdateAccessFeatureDto[],
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.deleteAccessFeatureByRoleId(queryRunner, roleId);
      features.map(
        async (feature) =>
          await this.createAccessFeature(queryRunner, {
            ...feature,
            roleId,
            createdBy,
          }),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error create bulk access feature',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createAccessFeature(
    trx: QueryRunner,
    createAccessFeatureDto: CreateUpdateAccessFeatureDto,
  ): Promise<void> {
    try {
      const {
        createdBy,
        roleId,
        featureId,
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
      } = createAccessFeatureDto;

      await trx.manager.insert(AccessFeature, {
        createdBy,
        role: { roleId },
        feature: { featureId },
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error create access feature',
        error.status || 500,
      );
    }
  }

  async deleteAccessFeatureByRoleId(
    trx: QueryRunner = null,
    roleId: string,
  ): Promise<void> {
    try {
      if (!trx) trx = this.repository.manager.connection.createQueryRunner();
      await trx.manager.delete(AccessFeature, { role: { roleId } });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete access feature by role id',
        error.status || 500,
      );
    }
  }
}
