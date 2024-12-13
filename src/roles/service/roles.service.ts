import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class RolesService {
  constructor(private roleRepository: RolesRepository) {}

  async getRoles(dto: PaginationDto): Promise<PaginatedResponseDto<Roles>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;

      const [data, totalItems] = await this.roleRepository.getRoles(
        skip,
        limit,
      );
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(roleId: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleById(roleId);

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to retrieve role');
    }
  }

  async getRoleByName(roleName: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleByName(roleName);

      if (!role) {
        throw new NotFoundException(`Role with name ${roleName} not found`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to retrieve role');
    }
  }

  async createRole(
    createRoleDto: CreateRoleDto,
    userId: string,
  ): Promise<string> {
    try {
      const newRole = await this.roleRepository.createRole({
        ...createRoleDto,
        createdBy: userId,
      });
      return newRole;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.getRoleById(roleId);

      await this.roleRepository.updateRole(roleId, {
        ...updateRoleDto,
        updatedBy: userId,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to update role');
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      await this.getRoleById(roleId);

      await this.roleRepository.deleteRole(roleId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to delete role');
    }
  }

  async getBaseRole(): Promise<string> {
    try {
      const role: Roles = await this.roleRepository.getBaseRole();

      return role.roleId;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting base role',
        error.status || 500,
      );
    }
  }
}
