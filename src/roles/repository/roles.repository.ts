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
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[Roles[], number]> {
    try {
      let query = this.repository.createQueryBuilder('roles');
      if (filters.length > 0) {
        filters.forEach((filter) => {
          if (filter.start && filter.end) {
            query = query.andWhere(
              `roles.${filter.key} BETWEEN :start AND :end`,
              { start: filter.start, end: filter.end },
            );
          } else {
            query = query.andWhere(`roles.${filter.key} IN (:...values)`, {
              values: filter.value,
            });
          }
        });
      }
      if (searchQuery) {
        const { query: searchText, searchBy } = searchQuery;
        searchBy.forEach((field: any) => {
          query = query.andWhere(`roles.${field} ILIKE :search`, {
            search: `%${searchText}%`,
          });
        });
      }
      if (sorts.length > 0) {
        sorts.forEach((sort) => {
          query = query.addOrderBy(
            `roles.${sort.key}`,
            sort.direction.toUpperCase(),
          );
        });
      }
      query = query.skip(skip).take(take);

      const [roles, count] = await query.getManyAndCount();

      return [roles, count];
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
