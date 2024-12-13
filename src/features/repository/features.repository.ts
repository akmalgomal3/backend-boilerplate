import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { FeaturesQuery } from '../query/features.query';

@Injectable()
export class FeaturesRepository {
  private repository: Repository<Features>;
  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Features);
  }

  async getFeatures(skip: number, take: number): Promise<[Features[], number]> {
    try {
      const features = await this.repository.query(FeaturesQuery.GET_FEATURES, [
        skip,
        take,
      ]);
      const count = await this.repository.query(FeaturesQuery.COUNT_FEATURES);

      return [features, parseInt(count[0].count)];
    } catch (error) {
      throw error;
    }
  }

  async getFeatureById(featureId: string): Promise<Features | null> {
    try {
      const data = await this.repository.query(
        FeaturesQuery.GET_FEATURE_BY_ID,
        [featureId],
      );

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getFeatureByName(featureName: string): Promise<Features | null> {
    try {
      const data = await this.repository.query(
        FeaturesQuery.GET_FEATURE_BY_NAME,
        [featureName],
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async createFeature(dto: CreateFeatureDto, userId: string): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newFeature = await queryRunner.query(FeaturesQuery.CREATE_FEATURE, [
        dto.featureName,
        dto.menuId || null,
        dto.description || null,
        dto.active ?? true,
        userId,
      ]);

      await queryRunner.commitTransaction();
      return newFeature[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      await queryRunner.query(FeaturesQuery.UPDATE_FEATURE, [
        dto.featureName || null,
        dto.menuId || null,
        dto.description || null,
        dto.active ?? null,
        userId,
        featureId,
      ]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(FeaturesQuery.DELETE_FEATURE, [featureId]);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
