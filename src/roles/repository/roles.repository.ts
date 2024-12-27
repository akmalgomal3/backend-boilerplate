import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { RolesQuery } from '../query/roles.query';

@Injectable()
export class RolesRepository {
  private repository: Repository<Roles>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Roles);
  }

  async getRoles(
    skip: number,
    take: number,
    search: string,
  ): Promise<[Roles[], number]> {
    try {
      const roles = await this.repository.query(RolesQuery.GET_ROLES, [
        skip,
        take,
        search,
      ]);
      const count = await this.repository.query(RolesQuery.COUNT_ROLES);

      return [roles, parseInt(count[0].count)];
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(roleId: string): Promise<Roles | null> {
    try {
      const data = await this.repository.query(RolesQuery.GET_ROLE_BY_ID, [
        roleId,
      ]);

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getRoleByName(roleName: string): Promise<Roles | null> {
    try {
      const data = await this.repository.query(RolesQuery.GET_ROLE_BY_NAME, [
        roleName,
      ]);

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async createRole(dto: CreateRoleDto): Promise<string> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRole = await queryRunner.query(RolesQuery.CREATE_ROLE, [
        dto.roleType,
        dto.roleName,
        dto.createdBy || null,
      ]);

      await queryRunner.commitTransaction();
      return newRole[0];
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
      await queryRunner.query(RolesQuery.UPDATE_ROLE, [
        dto.roleType || null,
        dto.roleName || null,
        dto.updatedBy || null,
        roleId,
      ]);

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
      await queryRunner.query(RolesQuery.DELETE_ROLE, [roleId]);
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
      const data = await this.repository.query(RolesQuery.GET_BASE_ROLE);

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      throw error;
    }
  }
}
