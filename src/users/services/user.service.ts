import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetBannedUsersDto } from '../dto/get-banned-users.dto';
import {
  SessionWithUser,
  UserWithSessions,
} from '../../common/types/user.type';
import { SessionService } from '../../libs/session/services/session.service';
import { LoginUserResponseType } from '../types/login-user-response.type';
import { UserRoles } from '../../common/enums/user.enum';
import { interval, Observable, switchMap } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private sessionService: SessionService,
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

  async getUser(id: string) {
    try {
      const result = await this.userRepository.getUserById(id);
      if (!result) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUniqueUser(username: string, email: string): Promise<boolean> {
    try {
      return await this.userRepository.isExist(username, email);
    } catch (error) {
      throw error;
    }
  }

  async createUser(data: CreateUserDto): Promise<Users> {
    try {
      return await this.userRepository.createUser(data);
    } catch (error) {
      throw error;
    }
  }

  async getUserByIdentifier(identifier: string): Promise<Users> {
    try {
      return await this.userRepository.getUserByIdentifier(identifier);
    } catch (error) {
      throw error;
    }
  }

  async addFailedLoginAttempts(userId: string): Promise<void> {
    try {
      await this.userRepository.addFailedLoginAttempts(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add failed login attempts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async banUser(userId: string, reason: string): Promise<void> {
    try {
      await this.userRepository.banUser(userId, reason);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to ban user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setFailedLoginAttemptsToZero(userId: string): Promise<void> {
    try {
      await this.userRepository.setFailedLoginAttemptsToZero(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to set failed login attempts to zero',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBannedUsers(
    dto: GetBannedUsersDto,
  ): Promise<PaginatedResponseDto<Users>> {
    try {
      const { page = 1, limit = 10, orderBy, orderIn, search } = dto;
      const skip: number = (page - 1) * limit;

      const [data, totalItems] = await this.userRepository.getBannedUsers(
        skip,
        limit,
        orderBy,
        orderIn,
        search,
      );
      const totalPages: number = Math.ceil(totalItems / limit);

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

  async getLoggedInUser(): Promise<LoginUserResponseType[]> {
    try {
      const sessions: SessionWithUser[] =
        await this.sessionService.getActiveSessions();

      return sessions.map((session: SessionWithUser) => ({
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        role: session.user.role as UserRoles,
        deviceType: session.device_type,
        lastActivity: session.last_activity,
        expiresAt: session.expires_at,
      }));
    } catch (error) {
      throw error;
    }
  }

  subscribeToGetLoggedInUser(): Observable<LoginUserResponseType[]> {
    return interval(3000).pipe(switchMap(() => this.getLoggedInUser()));
  }
}
