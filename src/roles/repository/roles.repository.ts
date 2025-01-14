import { Inject, Injectable } from '@nestjs/common';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { RoleType } from '../../common/enums/user-roles.enum';
import { UtilsService } from '../../libs/utils/services/utils.service';

@Injectable()
export class RolesRepository {
  private repository: Repository<Roles>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
    private utilsService: UtilsService,
  ) {
    this.repository = this.dataSource.getRepository(Roles);
  }

  async getRoles(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[Roles[], number]> {
    try {
      return await this.utilsService.getAllQuery(
        skip,
        take,
        filters,
        sorts,
        searchQuery,
        'roles',
        this.repository,
      );
    } catch (e) {
      throw e;
    }
  }

  async getRoleById(roleId: string): Promise<Roles | null> {
    try {
      const role = await this.repository.findOne({
        where: { roleId },
      });

      return role || null;
    } catch (error) {
      throw error;
    }
  }

  async getRoleByName(roleName: string): Promise<Roles | null> {
    try {
      const role = await this.repository.findOne({
        where: { roleName: ILike(roleName) },
      });

      return role || null;
    } catch (error) {
      throw error;
    }
  }

  async createRole(dto: CreateRoleDto): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRole = this.repository.create({
        roleType: dto.roleType,
        roleName: dto.roleName,
        createdBy: dto.createdBy || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedRole = await queryRunner.manager.save(newRole);

      await queryRunner.commitTransaction();
      return savedRole.roleId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateData = {
        roleName: dto.roleName || undefined,
        roleType: dto.roleType || undefined,
        updatedBy: dto.updatedBy || undefined,
        updatedAt: new Date(),
      };

      await queryRunner.manager.update(Roles, { roleId }, updateData);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Roles, { roleId });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkDeleteRoles(roleIds: string[]): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Roles, { roleId: In(roleIds) });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBaseRole(): Promise<Roles | null> {
    try {
      const role = await this.repository.findOne({
        where: {
          roleType: RoleType.Operator,
          roleName: 'Base Operator',
        },
      });

      return role || null;
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdateRoles(
    updates: { roleId: string; updateRoleDto: UpdateRoleDto }[],
    userId: string,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { roleId, updateRoleDto } of updates) {
        const updateData = {
          roleName: updateRoleDto.roleName || undefined,
          roleType: updateRoleDto.roleType || undefined,
          updatedBy: userId,
          updatedAt: new Date(),
        };

        await queryRunner.manager.update(Roles, { roleId }, updateData);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
