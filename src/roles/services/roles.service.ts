import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { Users } from 'src/users/entity/user.entity';
import { Roles } from '../entity/roles.entity';
import { CreateRoleDTO } from '../dto/create-role.dto';
import { UpdateRoleDTO } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private rolesRepository: RolesRepository){}

    async getRoles(dto: PaginationDto): Promise<PaginatedResponseDto<Roles>> {
        try {
            const { page = 1, limit = 10 } = dto;
            const skip = (page - 1) * limit;

            const [data, totalItems] = await this.rolesRepository.getAllRoles(skip, limit);
            const totalPages = Math.ceil(totalItems / limit);

            return {
                data,
                metadata: {
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Number(totalPages),
                    totalItems: Number(totalItems)
                }
            };
        } catch (e) {
            throw e;
        }
    }

    async getRoleById(roleId: string): Promise<Roles> {
        try {
            const result = await this.rolesRepository.getRoleById(roleId);
            if(!result){
                throw new HttpException("Role not found", HttpStatus.NOT_FOUND)
            }

            return result
        } catch (e) {
            throw e
        }
    }

    async createRole(createRoleDTO: CreateRoleDTO): Promise<Roles> {
        try {
            return this.rolesRepository.createRole(createRoleDTO);            
        } catch (e) {
            throw e
        }
    }

    async updateRole(id: string, updateRoleDTO: UpdateRoleDTO){
        try {
            await this.getRoleById(id)
            const result = await this.rolesRepository.updateRole(id, updateRoleDTO);

            return result
        } catch (e) {
            throw e
        }
    }

    async softDeleteRole(id: string){
        try {
            await this.getRoleById(id)
            const result = await this.rolesRepository.softDeleteRole(id);

            return result
        } catch (e) {
            throw e
        }
    }
}
