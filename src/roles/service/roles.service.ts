import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { RoleType } from '../../common/enums/user-roles.enum';
import { ERROR_MESSAGES_ROLES } from '../exception/roles.exceptions';

@Injectable()
export class RolesService {
  constructor(private roleRepository: RolesRepository) {}

  async getRoles(
    dto: PaginationDto,
    search: string,
  ): Promise<PaginatedResponseDto<Roles>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;

      const [data, totalItems] = await this.roleRepository.getRoles(
        skip,
        limit,
        search,
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
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_GET_ALL_ROLES,
        error.status || 500,
      );
    }
  }

  async getRoleById(roleId: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleById(roleId);

      if (!role) {
        new NotFoundException(
          ERROR_MESSAGES_ROLES.ERROR_GET_ROLE_BY_ID_NOT_FOUND(roleId),
        );
      }

      return role;
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_GET_ROLE_BY_ID,
        error.status || 500,
      );
    }
  }

  async getRoleByName(roleName: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleByName(roleName);

      if (!role) {
        new NotFoundException(
          ERROR_MESSAGES_ROLES.ERROR_GET_ROLE_BY_NAME_NOT_FOUND(roleName),
        );
      }

      return role;
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_GET_ROLE_BY_NAME,
        error.status || 500,
      );
    }
  }

  async createRole(
    createRoleDto: CreateRoleDto,
    userId: string,
  ): Promise<string> {
    try {
      const isAlreadyAvailable = await this.roleRepository.getRoleByName(
        createRoleDto.roleName,
      );

      if (isAlreadyAvailable) {
        new HttpException(
          ERROR_MESSAGES_ROLES.ERROR_CREATE_ROLE_ALREADY_AVAILABLE(
            createRoleDto.roleName,
          ),
          HttpStatus.CONFLICT,
        );
      }

      const validRoles = [
        RoleType.Executive,
        RoleType.Admin,
        RoleType.Operator,
      ];

      if (!validRoles.includes(createRoleDto.roleType)) {
        new HttpException(
          ERROR_MESSAGES_ROLES.ERROR_CREATE_ROLE_TYPE_INVALID(
            createRoleDto.roleType,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.roleRepository.createRole({
        ...createRoleDto,
        createdBy: userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_CREATE_ROLE,
        error.status || 500,
      );
    }
  }

  async updateRole(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
    userId: string,
  ): Promise<void> {
    try {
      const isExist = await this.getRoleById(roleId);

      if (!isExist) {
        new NotFoundException(
          ERROR_MESSAGES_ROLES.ERROR_UPDATE_ROLE_NOT_FOUND(roleId),
        );
      }

      const isAlreadyAvailable = await this.roleRepository.getRoleByName(
        updateRoleDto.roleName,
      );

      if (isAlreadyAvailable) {
        new HttpException(
          ERROR_MESSAGES_ROLES.ERROR_UPDATE_ROLE_ALREADY_AVAILABLE(
            updateRoleDto.roleName,
          ),
          HttpStatus.CONFLICT,
        );
      }

      const validRoles = [
        RoleType.Executive,
        RoleType.Admin,
        RoleType.Operator,
      ];

      if (
        updateRoleDto.roleType &&
        !validRoles.includes(updateRoleDto.roleType)
      ) {
        new HttpException(
          ERROR_MESSAGES_ROLES.ERROR_UPDATE_ROLE_TYPE_INVALID(
            updateRoleDto.roleType,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.roleRepository.updateRole(roleId, {
        ...updateRoleDto,
        updatedBy: userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_UPDATE_ROLE,
        error.status || 500,
      );
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const isExist = await this.getRoleById(roleId);

      if (!isExist) {
        new NotFoundException(
          ERROR_MESSAGES_ROLES.ERROR_DELETE_ROLE_NOT_EXIST(roleId),
        );
      }

      await this.roleRepository.deleteRole(roleId);
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_DELETE_ROLE,
        error.status || 500,
      );
    }
  }

  async getBaseRole(): Promise<string> {
    try {
      const role: Roles = await this.roleRepository.getBaseRole();

      return role.roleId;
    } catch (error) {
      throw new HttpException(
        error.message || ERROR_MESSAGES_ROLES.ERROR_GETTING_BASE_ROLE,
        error.status || 500,
      );
    }
  }
}
