import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import { PaginatedResponseDto, PaginationDto } from "src/common/dto/pagination.dto";
import { Users } from "../entity/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { RolesRepository } from "src/roles/repository/roles.repository";
import { ConfigService } from "@nestjs/config";
import { LoginDTO } from "src/users/dto/login.dto";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private roleRepository: RolesRepository,
       
    ) { }

    async getUsers(dto: PaginationDto): Promise<PaginatedResponseDto<Users>> {
        try {
            const { page = 1, limit = 10 } = dto;
            const skip = (page - 1) * limit;

            const [data, totalItems] = await this.userRepository.getUsers(skip, limit);
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
        } catch (error) {
            throw error;
        }
    }

    async getUser(userId: string): Promise<Users> {
        try {
            const result = await this.userRepository.getUserById(userId)
            if (!result) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND)
            }
            return result
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmailOrUsername(email: string, username: string){
        try {
            const result = await this.userRepository.getUserByEmailOrUsername(
                email,
                username,
            );

            return result
        } catch (e) {
            throw e
        }
    }

    async create(createUserDTO: CreateUserDto): Promise<Users> {
        try {
            const user = await this.userRepository.createUser(createUserDTO)
            return user
        } catch (e) {
            throw e
        }
    }

    
}