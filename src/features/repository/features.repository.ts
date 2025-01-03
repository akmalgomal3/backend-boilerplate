import { Inject, Injectable } from '@nestjs/common';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { CreateUpdateAccessFeatureDto } from '../dto/create-update-access-feature.dto';

@Injectable()
export class FeaturesRepository {
  private repository: Repository<Features>;
  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Features);
  }

  async getFeatures(
    skip: number,
    take: number,
    search: string,
  ): Promise<[Features[], number]> {
    try {
      const [features, count] = await this.repository.findAndCount({
        where: { featureName: ILike(`%${search}%`) },
        skip,
        take,
      });

      return [features, count];
    } catch (error) {
      throw error;
    }
  }

  async getFeatureById(featureId: string): Promise<Features | null> {
    try {
      const feature = await this.repository.findOne({
        where: { featureId },
      });

      return feature || null;
    } catch (error) {
      throw error;
    }
  }

  async getFeatureByName(featureName: string): Promise<Features | null> {
    try {
      const feature = await this.repository.findOne({
        where: { featureName: ILike(featureName) },
      });

      return feature || null;
    } catch (error) {
      throw error;
    }
  }

  async getFeatureNoMenuId(): Promise<Features[]> {
    try {
      const query = `SELECT 
                      feature_id as "featureId",
                      feature_name as "featureName",
                      menu_id as "menuId", 
                      description, 
                      active, 
                      created_at as "createdAt",
                      created_by as "createdBy",
                      updated_at as "updatedAt",
                      updated_by as "updatedBy"
                    FROM features 
                      WHERE menu_id IS NULL`;
      const features = await this.repository.query(query);
      return features;
    } catch (error) {
      throw error;
    }
  }

  async getFeatureByMenuId(menuId: string): Promise<Features[]> {
    try {
      const query = `SELECT 
                      feature_id as "featureId",
                      feature_name as "featureName",
                      menu_id as "menuId", 
                      description, 
                      active, 
                      created_at as "createdAt",
                      created_by as "createdBy",
                      updated_at as "updatedAt",
                      updated_by as "updatedBy"
                    FROM features 
                      WHERE menu_id = $1`;
      const features = await this.repository.query(query, [menuId]);
      return features;
    } catch (error) {
      throw error;
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
      await queryRunner.manager.delete(Features, { featureId });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAccessFeatureNoMenuId(roleId: string): Promise<Features[]> {
    try {
      const query = `SELECT 
                      af.access_feature_id as "accessFeatureId",
                      af.role_id as "roleId",
                      r.role_name as "roleName",
                      r.role_type as "roleType",
                      af.feature_id as "featureId",
                      f.feature_name as "featureName",
                      f.active as active,
                      f.menu_id as "menuId",
                      af.can_access as "canAccess",
                      af.can_read as "canRead",
                      af.can_insert as "canInsert",
                      af.can_update as "canUpdate",
                      af.can_delete as "canDelete",
                      af.created_at as "createdAt",
                      af.updated_at as "updatedAt",
                      af.created_by as "createdBy",
                      af.updated_by as "updatedBy"
                    FROM access_feature af
                    LEFT JOIN features f ON af.feature_id = f.feature_id
                    LEFT JOIN roles r ON af.role_id = r.role_id
                    WHERE f.menu_id IS NULL AND af.role_id = $1`;
      const features = await this.repository.query(query, [roleId]);
      return features;
    } catch (error) {
      throw error;
    }
  }

  async getAccessFeatureByRoleMenuId(
    roleId: string,
    menuId: string,
  ): Promise<Features[]> {
    try {
      const query = `
        SELECT 
          af.access_feature_id as "accessFeatureId",
          -- af.role_id as "roleId",
          -- r.role_name as "roleName",
          -- r.role_type as "roleType",
          af.feature_id as "featureId",
          f.feature_name as "featureName",
          f.active as active,
          f.menu_id as "menuId",
          af.can_access as "canAccess",
          af.can_read as "canRead",
          af.can_insert as "canInsert",
          af.can_update as "canUpdate",
          af.can_delete as "canDelete",
          af.created_at as "createdAt",
          af.updated_at as "updatedAt",
          af.created_by as "createdBy",
          af.updated_by as "updatedBy"
        FROM access_feature af
        INNER JOIN features f ON af.feature_id = f.feature_id
        -- INNER JOIN roles r ON af.role_id = r.role_id
        WHERE af.role_id = $1 AND f.menu_id = $2 AND f.active = true
      `;

      const result = await this.repository.query(query, [roleId, menuId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllFeatureNoMenuIdAccessByRoleId(
    roleId: string,
  ): Promise<Features[]> {
    try {
      const query = `SELECT features.feature_id as "featureId", 
                            features.feature_name as "featureName",
                            COALESCE(access_feature.can_access, false) as "canAccess", 
                            COALESCE(access_feature.can_read, false) as "canRead",
                            COALESCE(access_feature.can_update , false) as "canUpdate",
                            COALESCE(access_feature.can_delete, false) as "canDelete",
                            CASE WHEN 
                              access_feature.access_feature_id IS NOT NULL THEN true 
                              ELSE false 
                            END as "selected"
                    FROM features
                    LEFT JOIN access_feature on features.feature_id = access_feature.feature_id 
                    AND access_feature.role_id = $1
                    WHERE features.menu_id IS NULL AND features.active = true`;
      const result = await this.repository.query(query, [roleId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllFeatureAccessByMenuRoleId(
    menuId: string,
    roleId: string,
  ): Promise<Features[]> {
    try {
      const query = `SELECT features.feature_id as "featureId", 
                            features.feature_name as "featureName",
                            COALESCE(access_feature.can_access, false) as "canAccess", 
                            COALESCE(access_feature.can_read, false) as "canRead",
                            COALESCE(access_feature.can_insert, false) as "canInsert",
                            COALESCE(access_feature.can_update , false) as "canUpdate",
                            COALESCE(access_feature.can_delete, false) as "canDelete",
                            CASE WHEN 
                              access_feature.access_feature_id IS NOT NULL THEN true 
                              ELSE false 
                            END as "selected"
                    FROM features
                    LEFT JOIN access_feature on features.feature_id = access_feature.feature_id 
                    AND access_feature.role_id = $1
                    WHERE features.menu_id = $2 AND features.active = true`;
      const result = await this.repository.query(query, [roleId, menuId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getFeaturesNoMenuIdToCreateAccessFeature(): Promise<Features[]> {
    try {
      const query = `SELECT 
        feature_id as "featureId", 
        feature_name as "featureName", 
        false as "canAccess",
        false as "canRead",
        false as "canInsert",
        false as "canUpdate",
        false as "canDelete",
        false as "selected" 
      FROM features
      WHERE menu_id IS NULL AND active = true`;

      const features = await this.repository.query(query);
      return features;
    } catch (error) {
      throw error;
    }
  }

  async getFeaturesByMenuIdToCreateAccessFeature(
    menuId: string = null,
  ): Promise<Features[]> {
    try {
      const query = `SELECT 
        feature_id as "featureId", 
        feature_name as "featureName", 
        false as "canAccess",
        false as "canRead",
        false as "canInsert",
        false as "canUpdate",
        false as "canDelete",
        false as "selected" 
      FROM features
      WHERE menu_id = $1 AND active = true`;

      const features = await this.repository.query(query, [menuId]);
      return features;
    } catch (error) {
      throw error;
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAccessFeature(
    trx: QueryRunner,
    createAccessFeatureDto: CreateUpdateAccessFeatureDto,
  ) {
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

      const query = `
        INSERT INTO access_feature 
          (role_id, feature_id, can_access, can_read, can_insert, can_update, can_delete, created_by, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
        RETURNING 
                  -- access_feature_id as "accessFeatureId", 
                  role_id as "roleId", 
                  feature_id as "featureId", 
                  can_access as "canAccess", 
                  can_read as "canRead", 
                  can_insert as "canInsert", 
                  can_update as "canUpdate", 
                  can_delete as "canDelete", 
                  created_by as "createdBy"`;

      const values = [
        roleId,
        featureId,
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
        createdBy,
      ];

      const [create] = await trx.query(query, values);
      return create;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccessFeatureByRoleId(
    trx: QueryRunner = null,
    roleId: string,
  ): Promise<void> {
    try {
      if (!trx) trx = this.repository.manager.connection.createQueryRunner();
      const query = `DELETE FROM access_feature WHERE role_id = $1`;
      await trx.query(query, [roleId]);
    } catch (error) {
      throw error;
    }
  }
}
