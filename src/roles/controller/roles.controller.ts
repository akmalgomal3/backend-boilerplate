import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { RolesService } from '../service/roles.service';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { User } from '../../common/decorators/user.decorator';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async getRoles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.rolesService.getRoles({ page, limit });
    return {
      data: result.data,
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
      data: result,
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
}
