import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
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

    async getUsers(skip: number, take: number): Promise<[Users[], number]> {
        try {
            const result = await this.repository.findAndCount({
                skip,
                take,
                order: {
                    username: 'DESC'
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
            const query = `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`
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
            const query = `SELECT id, email, username, password FROM users WHERE (email = $1 OR username = $2) AND deleted_at IS NULL`            
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

    async updateUser(userId: string, dto: UpdateUserDto): Promise<void> { }

    async deleteUser(userId: string): Promise<void> { }
}