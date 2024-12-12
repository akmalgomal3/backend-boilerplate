import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  private repository: Repository<Users>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Users);
  }

  async getUsers(skip: number, take: number): Promise<[Users[], number]> {
    try {
      const result = await this.repository.findAndCount({
        skip,
        take,
        order: {
          username: 'DESC',
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<Users> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE user_id = $1`;
      const data = await this.repository.query(query, [userId]);
      if (!data) {
        throw new Error('User not found');
      }
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<Users> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE username = $1`;
      const data = await this.repository.query(query, [username]);

      return data[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserByEmail(email: string): Promise<Users> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE email = $1`;
      const data = await this.repository.query(query, [email]);

      return data[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
    isActive: boolean = true,
  ): Promise<Users> {
    try {
      console.log(createUserDto);
      const user_id = uuidv4();
      const {
        email,
        username,
        full_name,
        password,
        role_id,
        birthdate,
        phone_number,
      } = createUserDto;

      const query = `INSERT INTO users (email, username, full_name, password, role_id, birthdate, phone_number, user_id,
                                        created_by, active, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                     RETURNING *`;

      const data = await this.repository.query(query, [
        email,
        username,
        full_name,
        password,
        role_id,
        birthdate,
        phone_number,
        user_id,
        user_id,
        isActive,
      ]);

      return data[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating user',
        error.status || 500,
      );
    }
  }
}
