import { DataSource, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Roles } from '../entity/roles.entity';
import { CreateRoleDTO } from '../dto/create-role.dto';
import { UpdateRoleDTO } from '../dto/update-role.dto';

@Injectable()
export class RolesRepository {
    private repository: Repository<Roles>;
    constructor(
        @Inject('DB_POSTGRES')
        private dataSource: DataSource
    ) {
        this.repository = this.dataSource.getRepository(Roles);
    }

  async createRole({role}: CreateRoleDTO): Promise<Roles> {
    try {
        const result = await this.repository.query(
            `INSERT INTO roles (role) VALUES ($1) RETURNING *`,
            [role],
        );

        return result[0];  
    } catch (e) {
        throw e
    }
  }

  async getAllRoles(skip: number, take: number): Promise<[Roles[], number]>{
    try {
        const result = await this.repository.findAndCount({
            skip,
            take,
            order: {
                 created_at: 'DESC'
            }
        });

        return result
    } catch (e) {
        throw e
    }
  }

  
  async getRoleById(id: string): Promise<Roles> {
    const result = await this.repository.query(
      `SELECT * FROM roles WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    
    return result[0];
  }

  
  async updateRole(id: string, {role}: UpdateRoleDTO): Promise<Roles> {
    try {
        const result = await this.repository.query(
            `UPDATE roles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [role, id],
        );

        return result[0];
    } catch (e) {
        throw e
    }
  }

  
  async softDeleteRole(id: string): Promise<Roles> {
    try {
        const result = await this.repository.query(
            `UPDATE roles SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
            [id],
        );

        return result[0];
    } catch (e) {
        throw e
    }
  }
}
