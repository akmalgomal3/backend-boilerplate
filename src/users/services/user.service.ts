import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesService } from '../../roles/service/roles.service';
import { GetUnapprovedUserDto } from '../dto/get-unapproved-user.dto';

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

  async getUserAuthByUsername(username: string) {
    try {
      const result = await this.userRepository.getUserAuthByUsername(username);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserAuthByEmail(email: string) {
    try {
      const result = await this.userRepository.getUserAuthByEmail(email);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
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

  async createUserAuth(createUserDto: CreateUserDto) {
    try {
      const roleId =
        createUserDto?.roleId || (await this.rolesService.getBaseRole());
      return this.userRepository.createUserAuth(
        { ...createUserDto, roleId },
        true,
      );
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Error creating user',
        error.status ?? 500,
      );
    }
  }

  async getUnapprovedUsers(getUnapprovedDto: GetUnapprovedUserDto) {
    try {
      const {
        page = 1,
        limit: take = 10,
        sortByDate,
        search,
      } = getUnapprovedDto;
      const skip: number = (page - 1) * take;
      const [data, total] = await this.userRepository.getUnapprovedUsers(
        take,
        skip,
        search,
        sortByDate,
      );

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(take),
          total: Number(total),
          totalPages: Number(Math.ceil(total / take)),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting unapproved users',
        error.status || 500,
      );
    }
  }
}
