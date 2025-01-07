import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RolesService } from '../service/roles.service';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { User } from '../../common/decorators/user.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthorizedRoles } from '../../common/decorators/authorized-roles.decorator';
import { RoleType } from '../../common/enums/user-roles.enum';
import { FormInfo } from 'src/common/types/form-info.type';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiBearerAuth()
@AuthorizedRoles(RoleType.Admin)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  async getRoles(@Body() paginationDto: PaginationDto) {
    const result = await this.rolesService.getRoles(paginationDto);
    return {
      data: {
        body: result.data,
        sort: paginationDto.sorts || [],
        filter: paginationDto.filters || [],
        search: paginationDto.search || [],
      },
      metadata: result.metadata,
    };
  }

  @Get(':roleId')
  async getRoleById(@Param('roleId') roleId: string): Promise<{ data: Roles }> {
    const result = await this.rolesService.getRoleById(roleId);
    return {
      data: result,
    };
  }

  @Get('name/:roleName')
  async getRoleByName(
    @Param('roleName') roleName: string,
  ): Promise<{ data: Roles }> {
    const result = await this.rolesService.getRoleByName(roleName);
    return {
      data: result,
    };
  }

  @Get('form/create-update')
  @ApiQuery({ name: 'id', required: false })
  async getFormCreateUpdate(
    @Query('id', new ParseUUIDPipe({ optional: true })) roleId: string,
  ): Promise<{ data: FormInfo }> {
    const formInfo = await this.rolesService.formCreateUpdateRole(roleId);
    return {
      data: formInfo,
    };
  }

  @Post()
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.rolesService.createRole(
      createRoleDto,
      user.userId,
    );
    return {
      data: {
        roleId: result,
      },
    };
  }

  @Patch(':roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.rolesService.updateRole(
      roleId,
      updateRoleDto,
      user.userId,
    );
    return {
      data: result,
    };
  }

  @Delete(':roleId')
  async deleteRole(@Param('roleId') roleId: string) {
    const result = await this.rolesService.deleteRole(roleId);
    return {
      data: result,
    };
  }

  @Get('/header/info')
  async getHeaderInfo() {
    const result = await this.rolesService.getRoleHeader();
    return {
      data: result,
    };
  }

  @Get('enum/role-type')
  async getRolesType() {
    const result = Object.values(RoleType).map((value, index) => ({
      key: index + 1,
      value,
    }));
    return {
      data: result,
    };
  }
}
