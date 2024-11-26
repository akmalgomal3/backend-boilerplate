import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDTO } from '../dto/create-role.dto';
import { UpdateRoleDTO } from '../dto/update-role.dto';

@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) { }

    @Get()
    async getRoles(
        @Query('page') page: number,
        @Query('limit') limit: number
    ){
        const result = await this.rolesService.getRoles({ page, limit })
        return {
            metadata: result.metadata,
            data: result.data,
        };
    }

    @Get('role/:id')
    async getRoleById(@Param('id', ParseUUIDPipe) id: string){
        const result = await this.rolesService.getRoleById(id)
        return {
            data: result,
        };
    }

    @Post()
    async createRole(@Body() createRoleDTO: CreateRoleDTO){
        const result = await this.rolesService.createRole(createRoleDTO)
        return {
            data: result,
        };
    }

    @Patch(':id')
    async updateRole(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateRoleDTO: UpdateRoleDTO,
    ) {
        const result = await this.rolesService.updateRole(id, updateRoleDTO);
        return {
            data: result,
        };
    }

    @Delete(':id')
    async softDeleteRole(@Param('id') id: string){
        const result = await this.rolesService.softDeleteRole(id);
        return {
            data: result,
        };
    }
}
