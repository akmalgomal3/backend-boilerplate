import { Inject, Injectable } from '@nestjs/common';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { RolesQuery } from '../query/roles.query';
import { RoleType } from '../../common/enums/user-roles.enum';

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
      const roles = await this.repository.query(
        RolesQuery.GET_ROLES(skip, take, search),
      );
      const count = await this.repository.query(RolesQuery.COUNT_ROLES);

      return [roles, parseInt(count[0].count)];
    } catch (error) {
      throw error;
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
}
