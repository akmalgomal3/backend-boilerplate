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
import { ErrorMessages } from '../../common/exceptions/root-error.message';
import { HeaderTable } from '../../common/types/header-table.type';
import { FormInfo } from 'src/common/types/form-info.type';
import { UtilsService } from '../../libs/utils/services/utils.service';

@Injectable()
export class RolesService {
  constructor(
    private roleRepository: RolesRepository,
    private utilsService: UtilsService,
  ) {}

  async getRoles(dto: PaginationDto): Promise<PaginatedResponseDto<Roles>> {
    try {
      const { page = 1, limit = 10, filters, sorts, search } = dto;
      const skip = (page - 1) * limit;

      const filterConditions = this.utilsService.buildFilterConditions(filters);
      const sortConditions = this.utilsService.buildSortConditions(sorts);
      const searchQuery = this.utilsService.buildSearchQuery(search);

      const [data, totalItems] = await this.roleRepository.getRoles(
        skip,
        limit,
        filterConditions,
        sortConditions,
        searchQuery,
      );

      return {
        data,
        metadata: this.utilsService.calculatePagination(
          totalItems,
          limit,
          page,
        ),
      };
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.roles.getMessage('ERROR_GET_ALL_ROLES'),
        error.status || 500,
      );
    }
  }

  async getRoleById(roleId: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleById(roleId);

      if (!role) {
        throw new NotFoundException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_GET_ROLE_BY_ID_NOT_FOUND'),
            { roleId: roleId },
          ),
        );
      }

      return role;
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.roles.getMessage('ERROR_GET_ROLE_BY_ID'),
        error.status || 500,
      );
    }
  }

  async getRoleByName(roleName: string): Promise<Roles> {
    try {
      const role = await this.roleRepository.getRoleByName(roleName);

      if (!role) {
        throw new NotFoundException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_GET_ROLE_BY_NAME_NOT_FOUND'),
            { roleName: roleName },
          ),
        );
      }

      return role;
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.roles.getMessage('ERROR_GET_ROLE_BY_NAME'),
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
        throw new HttpException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage(
              'ERROR_CREATE_ROLE_ALREADY_AVAILABLE',
            ),
            { roleName: createRoleDto.roleName },
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
        throw new HttpException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_CREATE_ROLE_TYPE_INVALID'),
            { roleType: createRoleDto.roleType },
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
        error.message || ErrorMessages.roles.getMessage('ERROR_CREATE_ROLE'),
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
      await this.validateRoleUpdate(roleId, updateRoleDto);
      await this.roleRepository.updateRole(roleId, {
        ...updateRoleDto,
        updatedBy: userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE'),
        error.status || 500,
      );
    }
  }

  async bulkUpdateRole(
    updates: { roleId: string; updateRoleDto: UpdateRoleDto }[],
    userId: string,
  ): Promise<void> {
    try {
      for (const { roleId, updateRoleDto } of updates) {
        await this.validateRoleUpdate(roleId, updateRoleDto);
      }

      await this.roleRepository.bulkUpdateRoles(updates, userId);
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.roles.getMessage('ERROR_BULK_UPDATE_ROLE'),
        error.status || 500,
      );
    }
  }

  private async validateRoleUpdate(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    await this.ensureRoleExists(roleId);
    if (updateRoleDto.roleName) {
      await this.ensureRoleNameIsUnique(updateRoleDto.roleName);
    }
    this.ensureValidRoleType(updateRoleDto.roleType);
  }

  private async ensureRoleExists(roleId: string): Promise<void> {
    const isExist = await this.getRoleById(roleId);
    if (!isExist) {
      throw new NotFoundException(
        ErrorMessages.roles.dynamicMessage(
          ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE_NOT_FOUND'),
          { roleId },
        ),
      );
    }
  }

  private async ensureRoleNameIsUnique(roleName: string): Promise<void> {
    const isAlreadyAvailable =
      await this.roleRepository.getRoleByName(roleName);
    if (isAlreadyAvailable) {
      throw new HttpException(
        ErrorMessages.roles.dynamicMessage(
          ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE_ALREADY_AVAILABLE'),
          { roleName },
        ),
        HttpStatus.CONFLICT,
      );
    }
  }

  private ensureValidRoleType(roleType?: RoleType): void {
    const validRoles = [RoleType.Executive, RoleType.Admin, RoleType.Operator];
    if (roleType && !validRoles.includes(roleType)) {
      throw new HttpException(
        ErrorMessages.roles.dynamicMessage(
          ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE_TYPE_INVALID'),
          { roleType },
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const isExist = await this.getRoleById(roleId);

      if (!isExist) {
        throw new NotFoundException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_DELETE_ROLE_NOT_EXIST'),
            { roleId: roleId },
          ),
        );
      }

      await this.roleRepository.deleteRole(roleId);
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.roles.getMessage('ERROR_DELETE_ROLE'),
        error.status || 500,
      );
    }
  }

  async bulkDeleteRole(roleIds: { roleId: string }[]): Promise<void> {
    try {
      const nonExistentRoles = [];

      for (const { roleId } of roleIds) {
        const isExist = await this.getRoleById(roleId);
        if (!isExist) {
          nonExistentRoles.push(roleId);
        }
      }

      if (nonExistentRoles.length > 0) {
        throw new NotFoundException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_DELETE_ROLE_NOT_EXIST'),
            { roleIds: nonExistentRoles.join(', ') },
          ),
        );
      }

      await this.roleRepository.bulkDeleteRoles(
        roleIds.map(({ roleId }) => roleId),
      );
    } catch (error) {
      throw new HttpException(
        error.message ||
          ErrorMessages.roles.getMessage('ERROR_BULK_DELETE_ROLE'),
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
        error.message ||
          ErrorMessages.roles.getMessage('ERROR_GETTING_BASE_ROLE'),
        error.status || 500,
      );
    }
  }

  async getRoleHeader(): Promise<HeaderTable[]> {
    try {
      return [
        {
          key: 'roleName',
          label: 'Role Name',
          filterable: true,
          sortable: true,
          editable: true,
          searchable: true,
          type: 'text',
          option: {},
          inlineEdit: true,
        },
        {
          key: 'roleType',
          label: 'Role Type',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: true,
          type: 'select',
          option: {
            type: 'url',
            value: '/options/enum/RoleType',
          },
          inlineEdit: false,
        },
        {
          key: 'createdAt',
          label: 'Created At',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: false,
          type: 'datetime',
          option: {},
          inlineEdit: false,
        },
        {
          key: 'updatedAt',
          label: 'Last Updated',
          filterable: true,
          sortable: true,
          editable: false,
          searchable: false,
          type: 'datetime',
          option: {},
          inlineEdit: false,
        },
      ];
    } catch (e) {
      throw new HttpException(
        e.message ||
          ErrorMessages.roles.getMessage('ERROR_GETTING_ROLE_HEADER'),
        e.status || 500,
      );
    }
  }

  async formCreateUpdateRole(roleId: string = null): Promise<FormInfo> {
    const formInfo: FormInfo = {
      id: null,
      title: `Create Role`,
      description: `Create Role`,
      fields: [
        {
          type: 'text',
          key: 'roleId',
          label: 'Role Id',
          value: '',
          required: true,
          placeholder: '',
          option: {},
          visible: false,
          disable: true,
          prefix: '',
          suffix: '',
        },
        {
          type: 'text',
          key: 'roleName',
          label: 'Role Name',
          value: '',
          required: true,
          placeholder: 'input role name',
          option: {},
          visible: false,
          disable: false,
          prefix: '<UserOutlined />',
          suffix: '',
        },
        {
          type: 'enum',
          key: 'roleType',
          label: 'Role Type',
          value: '',
          required: true,
          placeholder: 'input role type',
          option: {
            type: 'url',
            value: '/options/enum/user-roles',
          },
          visible: false,
          disable: false,
          prefix: '',
          suffix: '',
        },
      ],
    };

    if (roleId) {
      formInfo.title = 'Update Role';
      formInfo.description = 'Update Role';
      formInfo.id = roleId;

      const roleOne = await this.getRoleById(roleId);
      for (const field of formInfo.fields) {
        field.value = roleOne[field.key];
      }
    }

    return formInfo;
  }
}
