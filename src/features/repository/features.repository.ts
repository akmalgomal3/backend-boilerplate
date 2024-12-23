import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Feature, Repository } from 'typeorm';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { Features } from '../entity/features.entity';
import { FeaturesQuery } from '../query/features.query';
import { CreateAccessFeatureDto } from '../dto/create-access-feature.dto';
import { UpdateAccessFeatureDto } from '../dto/update-access-feature.dto';
import { AccessFeature } from '../entity/access_feature.entity';

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

  async createAccessFeature(createAccessFeatureDto: CreateAccessFeatureDto) {
    try {
      const {
        roleId,
        featureId,
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
        createdBy,
      } = createAccessFeatureDto;

      const query = `
        INSERT INTO access_feature 
          (role_id, feature_id, can_access, can_read, can_insert, can_update, can_delete, created_by, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
        RETURNING access_feature_id as "accessFeatureId", 
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

      const [create] = await this.repository.query(query, values);
      return create;
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
        INNER JOIN features f ON af.feature_id = f.feature_id
        INNER JOIN roles r ON af.role_id = r.role_id
        WHERE af.role_id = $1 AND f.menu_id = $2 AND f.active = true
      `;

      const result = await this.repository.query(query, [roleId, menuId]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAccessFeatureByRoleFeatureId(roleId: string, featureId: string) {
    try {
      const query = `
        SELECT 
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
        INNER JOIN features f ON af.feature_id = f.feature_id
        INNER JOIN roles r ON af.role_id = r.role_id
        WHERE af.role_id = $1 AND af.feature_id = $2
      `;

      const [result] = await this.repository.query(query, [roleId, featureId]);
      return {
        accessFeatureId: result.accessFeatureId,
        canAccess: result.canAccess,
        canRead: result.canRead,
        canInsert: result.canInsert,
        canUpdate: result.canUpdate,
        canDelete: result.canDelete,
        createdAt: result.createAt,
        createdBy: result.createBy,
        updatedAt: result.updateAt,
        updatedBy: result.updatedBy,
        feature: {
          featureId: result.featureId,
          menuId: result.menuId,
          featureName: result.featureName,
          active: result.active,
        },
        role: {
          roleId: result.roleId,
          roleName: result.roleName,
          roleType: result.roleType,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccessFeatureById(
    accessFeatureId: string,
  ): Promise<Partial<AccessFeature>> {
    try {
      const query = `
        SELECT 
          af.access_feature_id as "accessFeatureId",
          af.role_id as "roleId",
          r.role_name as "roleName",
          r.role_type as "roleType",
          af.feature_id as "featureId",
          f.menu_id as "menuId",
          f.feature_name as "featureName",
          f.active as active,
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
        WHERE af.access_feature_id = $1
      `;

      const [result] = await this.repository.query(query, [accessFeatureId]);
      return {
        accessFeatureId: result.accessFeatureId,
        canAccess: result.canAccess,
        canRead: result.canRead,
        canInsert: result.canInsert,
        canUpdate: result.canUpdate,
        canDelete: result.canDelete,
        createdAt: result.createAt,
        createdBy: result.createBy,
        updatedAt: result.updateAt,
        updatedBy: result.updatedBy,
        feature: {
          featureId: result.featureId,
          menuId: result.menuId,
          featureName: result.featureName,
          active: result.active,
        },
        role: {
          roleId: result.roleId,
          roleName: result.roleName,
          roleType: result.roleType,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAccessFeatureById(
    accessFeatureId: string,
    updateAccessFeatureDto: UpdateAccessFeatureDto,
  ) {
    try {
      const {
        roleId,
        featureId,
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
        updatedBy,
      } = updateAccessFeatureDto;

      const query = `
      UPDATE access_feature
      SET 
        role_id = COALESCE($1, role_id),
        feature_id = COALESCE($2, feature_id),
        can_access = COALESCE($3, can_access),
        can_read = COALESCE($4, can_read),
        can_insert = COALESCE($5, can_insert),
        can_update = COALESCE($6, can_update),
        can_delete = COALESCE($7, can_delete),
        updated_by = COALESCE($8, updated_by),
        updated_at = NOW()
      WHERE access_feature_id = $9
      RETURNING access_feature_id as "accessFeatureId", 
                role_id as "roleId", 
                feature_id as "featureId", 
                can_access as "canAccess", 
                can_read as "canRead", 
                can_insert as "canInsert", 
                can_update as "canUpdate", 
                can_delete as "canDelete", 
                updated_by as "updatedBy", 
                updated_at as "updatedAt"
      `;

      const values = [
        roleId,
        featureId,
        canAccess,
        canRead,
        canInsert,
        canUpdate,
        canDelete,
        updatedBy,
        accessFeatureId,
      ];

      const [updated] = await this.repository.query(query, values);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccessMenuFeature(
    accessFeatureId: string,
  ): Promise<AccessFeature> {
    try {
      const query = `
        DELETE FROM access_feature
        WHERE access_feature_id = $1
        RETURNING access_feature_id as "accessFeatureId", 
                  role_id as "roleId", 
                  feature_id as "featureId", 
                  can_access as "canAccess", 
                  can_read as "canRead", 
                  can_insert as "canInsert", 
                  can_update as "canUpdate", 
                  can_delete as "canDelete"
      `;

      const [deleted] = await this.repository.query(query, [accessFeatureId]);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}
