import { Inject, Injectable } from "@nestjs/common";
import { Brackets, DataSource, ILike, Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { Users } from "../entity/user.entity";

@Injectable()
export class UserRepository {
    private repository: Repository<Users>;
    constructor(
        @Inject('DB_POSTGRES')
        private dataSource: DataSource
    ) {
        this.repository = this.dataSource.getRepository(Users);
    }

    async getUsers(skip: number, take: number, isBanned: boolean, search: string): Promise<[Users[], number]> {
        try {
            const result = await this.repository.findAndCount({
                select: ['id', 'username', 'email', "full_name", "is_banned", "active", "created_at"],
                skip,
                take,
                order: {
                    username: 'DESC'
                },
                where:{
                    full_name: search ? ILike(`%${search}%`) : undefined, 
                    is_banned: isBanned ? isBanned : undefined
                }
            });

            return result
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId: string): Promise<Users | null> {
        try {
            // const result = await this.repository.findOne({ where: { user_id: userId } })
            
            // contoh raw query
            const query = `SELECT u.id as id, u.email as email, u.full_name as full_name, r.role as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1 AND u.deleted_at IS NULL`
            const data = await this.repository.query(query, [userId])
            if (!data) {
                throw new Error('User not found');
            }

            return data
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmailOrUsername(email: string, username: string): Promise<Users | null>{
        try {
            const query = `SELECT u.id, u.email, u.username, u.password, u.login_attemp, u.is_banned, r.role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE (u.email = $1 OR u.username = $2) AND u.deleted_at IS NULL `            
            const data = await this.repository.query(query, [email, username])
        
            return data[0]
        } catch (e) {
            throw e
        }
    }

    async createUser(createUserDTO: CreateUserDto): Promise<Users> { 
        const { role_id, full_name, email, username, password, is_dev } = createUserDTO;

        try {
            const active = is_dev
            const query = `
                INSERT INTO users (role_id, full_name, email, username, password, active, is_dev)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const result = await this.dataSource.query(query, [
                role_id,
                full_name,
                email,
                username,
                password,
                active, 
                is_dev
            ]);
    
          return result[0];
        } catch (e) {
          throw e;
        }
    }

    async updateLoginAttempUser(userId: string, loginAttempUpdated: number): Promise<Users>{
        try {
            const query = `UPDATE users SET login_attemp = $1, updated_at = NOW()
                            WHERE id = $2 RETURNING id, username;`;
            const result = await this.dataSource.query(query, [loginAttempUpdated, userId])
            return result 
        } catch (e) {
            throw e
        }
    }

    async updateBannedUser(userId: string, isBanned: boolean): Promise<Users>{
        try {
            const query = `UPDATE users SET is_banned = $1, updated_at = NOW()
                            WHERE id = $2 RETURNING id, username;`;
            const result = await this.dataSource.query(query, [isBanned, userId])
            return result 
        } catch (e) {
            throw e
        }
    }

    async updateUser(userId: string, dto: UpdateUserDto): Promise<void> { }

    async deleteUser(userId: string): Promise<void> { }
}