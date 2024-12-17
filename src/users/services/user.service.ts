import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesService } from '../../roles/service/roles.service';
import { GetUnapprovedUserDto } from '../dto/get-unapproved-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private rolesService: RolesService,
    private utilsService: UtilsService,
  ) {}

  async getUsers(
    dto: PaginationDto,
  ): Promise<PaginatedResponseDto<Partial<Users>>> {
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

  async getUser(userId: string): Promise<Users> {
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
        true,
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

  async approveUser(userAuthId: string, approverId: string, roleId: string) {
    try {
      const newUser: Users = await this.userRepository.approveUser(
        userAuthId,
        approverId,
        roleId,
      );

      return {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error approving user',
        e.status || 500,
      );
    }
  }

  async banUser(userId: string, bannedBy: string) {
    try {
      return await this.userRepository.banUser(userId, bannedBy);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error banning user',
        e.status || 500,
      );
    }
  }

  async updateUserByUserId(updateUserDto: UpdateUserDto): Promise<Users> {
    try {
      const getUserUpdatedById = await this.getUser(updateUserDto.updatedBy);
      if (!getUserUpdatedById) {
        throw new HttpException('User updated not found', HttpStatus.NOT_FOUND);
      }

      const getUserById = await this.getUser(updateUserDto.userId);
      if (!getUserById) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (getUserById.username != updateUserDto.username) {
        await this.validateUsernameEmail(updateUserDto.username);
      }

      const getRoleByRoleId = await this.rolesService.getRoleById(
        updateUserDto.roleId,
      );
      if (!getRoleByRoleId) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      const { roleId, userId, ...updatedDto } = updateUserDto;
      const updateUser = await this.userRepository.updateUserById(
        userId,
        updatedDto,
        getRoleByRoleId,
      );
      return updateUser;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error update user',
        e.status || 500,
      );
    }
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(
        this.utilsService.decrypt(oldPassword),
        user.password,
      );
      if (!isMatch) {
        throw new BadRequestException('Invalid old password');
      }

      const password = this.validatePassword(
        newPassword,
        confirmPassword,
        oldPassword,
      );

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userRepository.updateUserPassword(user.userId, hashedPassword);

      return {
        message: `User ${user.username} password updated successfully`,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating password',
        e.status || 500,
      );
    }
  }

  async updateUserAuthEmail(userId: string, email: string) {
    try {
      const result = await this.userRepository.updateUserAuthEmail(
        userId,
        email,
      );

      return result;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating email',
        e.status || 500,
      );
    }
  }

  async getUserAuthById(userId: string) {
    try {
      const result = await this.userRepository.getUserAuthById(userId);

      return result;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error getting user by id',
        e.status || 500,
      );
    }
  }

  async deleteUserByUserId(userId: string): Promise<Number> {
    try {
      /*
        TO DO: 
          - Delete user activity with user relations
      */

      const deleteUser = await this.userRepository.deleteByUserId(userId);
      return deleteUser;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error delete user',
        e.status || 500,
      );
    }
  }

  private validatePassword(
    newPassword: string,
    confirmPassword: string,
    oldPassword: string,
  ) {
    const decryptedPassword = this.utilsService.decrypt(newPassword);
    const decryptedConfirmPassword = this.utilsService.decrypt(confirmPassword);
    const decryptedOldPassword = this.utilsService.decrypt(oldPassword);

    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (decryptedPassword === decryptedOldPassword) {
      throw new BadRequestException(
        'New password cannot be the same as old password',
      );
    }

    return decryptedPassword;
  }

  async validateUsernameEmail(
    username: string,
    email: string | null = null,
    isApproval = false,
  ) {
    const [userByUsername, userByEmail] = await Promise.all([
      this.getUserByUsername(username),
      this.getUserByEmail(email),
    ]);

    if (username && userByUsername) {
      throw new BadRequestException(
        'Username is registered in our system, please use another username',
      );
    }

    if (email && userByEmail) {
      throw new BadRequestException(
        'Email is registered in our system, please use another email',
      );
    }

    if (isApproval) {
      const userAuthByUsername = await this.getUserAuthByUsername(username);
      const userAuthByEmail = await this.getUserAuthByEmail(email);

      if (userAuthByUsername) {
        throw new BadRequestException(
          'Username already registered, Please wait for approval or contact admin',
        );
      }

      if (userAuthByEmail) {
        throw new BadRequestException(
          'Email already registered, Please wait for approval or contact admin',
        );
      }
    }
  }
}
