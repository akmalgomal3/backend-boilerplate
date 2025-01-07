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
import { IsUUID } from 'class-validator';

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
      const isExist = await this.getRoleById(roleId);

      if (!isExist) {
        throw new NotFoundException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE_NOT_FOUND'),
            { roleId: roleId },
          ),
        );
      }

      const isAlreadyAvailable = await this.roleRepository.getRoleByName(
        updateRoleDto.roleName,
      );

      if (isAlreadyAvailable) {
        throw new HttpException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage(
              'ERROR_UPDATE_ROLE_ALREADY_AVAILABLE',
            ),
            { roleName: updateRoleDto.roleName },
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
        throw new HttpException(
          ErrorMessages.roles.dynamicMessage(
            ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE_TYPE_INVALID'),
            { roleType: updateRoleDto.roleType },
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
        error.message || ErrorMessages.roles.getMessage('ERROR_UPDATE_ROLE'),
        error.status || 500,
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
          type: 'string',
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
          type: 'enum',
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
          type: 'date',
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
          type: 'date',
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

  async formCreateUpdateRole(
    roleId: string = null
  ): Promise<FormInfo>{
    const formInfo: FormInfo = {
      id: null,
      title: `Create Role`,
      description: `Create Role`,
      fields: [
        {
          type: "text",
          key: "roleId",
          label: "Role Id",
          value: "",
          required: true,
          placeholder: "",
          option: {},
          visible: true,
          disable: true,
          prefix: "",
          suffix: ""
        },
        {
          type: "text",
          key: "roleName",
          label: "Role Name",
          value: "",
          required: true,
          placeholder: "input role name",
          option: {},
          visible: false,
          disable: false,
          prefix: "<UserOutlined />",
          suffix: ""
        },
        {
          type: "enum",
          key: "roleType",
          label: "Role Type",
          value: "",
          required: true,
          placeholder: "input role type",
          option: {
            type: "url",
            value: "/options/enum/user-roles"
          },
          visible: false,
          disable: false,
          prefix:"",
          suffix: ""
        }
      ]
    }

    if(roleId){
      formInfo.title = "Update Role"
      formInfo.description = "Update Role"
      formInfo.id = roleId

      const roleOne = await this.getRoleById(roleId)
      for (const field of formInfo.fields){
        field.value = roleOne[field.key]
      }
    }

    return formInfo
  }
}
