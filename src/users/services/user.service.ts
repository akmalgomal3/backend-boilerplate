import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import * as cryptoJS from 'crypto-js';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async decryptPassword(encryptedPassword: string) {
    const cryptoSecret = process.env.CRYPTO_SECRET;
    const bytes = cryptoJS.AES.decrypt(encryptedPassword, cryptoSecret);
    return bytes.toString(cryptoJS.enc.Utf8);
  }

  async incrementFailedLoginAttempts(userId: string) {
    return await this.userRepository.incrementFailedLoginAttempts(userId);
  }

  async resetFailedLoginAttempts(userId: string) {
    return await this.userRepository.resetFailedLoginAttempts(userId);
  }

  async banUser(userId: string) {
    return await this.userRepository.banUser(userId);
  }

  async findBannedUsers() {
    return await this.userRepository.findBannedUsers();
  }

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }
    const existingUsername = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const cryptoSecret = process.env.CRYPTO_SECRET;
    const encryptedPassword = cryptoJS.AES.encrypt(
      hashedPassword,
      cryptoSecret,
    ).toString();
    return await this.userRepository.createUser({
      ...createUserDto,
      password: encryptedPassword,
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.getUserById(userId);
    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      const cryptoSecret = process.env.CRYPTO_SECRET;
      const encryptedPassword = cryptoJS.AES.encrypt(
        hashedPassword,
        cryptoSecret,
      ).toString();
      return await this.userRepository.updateUser(userId, {
        ...updateUserDto,
        password: encryptedPassword,
      });
    }
    return await this.userRepository.updateUser(userId, updateUserDto);
  }
}
