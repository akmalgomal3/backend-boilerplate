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

  async getRoles(skip: number, take: number): Promise<[Roles[], number]> {
    try {
      const roles = await this.repository.query(RolesQuery.GET_ROLES, [
        skip,
        take,
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

  async createRole(dto: CreateRoleDto): Promise<string> {
    try {
      const newRole = await this.repository.query(RolesQuery.CREATE_ROLE, [
        dto.roleType,
        dto.roleName,
        dto.createdBy || null,
      ]);
      return newRole[0];
    } catch (error) {
      throw error;
    }
  }

  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<void> {
    try {
      await this.repository.query(RolesQuery.UPDATE_ROLE, [
        dto.roleType || null,
        dto.roleName || null,
        dto.updatedBy || null,
        roleId,
      ]);
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      await this.repository.query(RolesQuery.DELETE_ROLE, [roleId]);
    } catch (error) {
      throw error;
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
