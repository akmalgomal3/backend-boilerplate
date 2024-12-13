import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserWithRole } from '../../common/types/user-with-role.type';
import { RolesService } from '../../roles/service/roles.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private rolesService: RolesService,
  ) {}

  async getUsers(dto: PaginationDto): Promise<PaginatedResponseDto<Users>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;

      const [data, totalItems] = await this.userRepository.getUsers(
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

  async getUser(userId: string) {
    try {
      const result = await this.userRepository.getUserById(userId);
      if (!result) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const result = await this.userRepository.getUserByUsername(username);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      const result = await this.userRepository.getUserByEmail(email);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      let roleId: string = createUserDto.roleId;

      if (!roleId) {
        roleId = await this.rolesService.getBaseRole();
      }
      return this.userRepository.createUser(
        {
          ...createUserDto,
          roleId,
        },
        !!createUserDto.roleId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating user',
        error.status || 500,
      );
    }
  }
}
