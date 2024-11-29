import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Users } from '../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

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

  async getUserById(userId: string): Promise<Users | null> {
    try {
      // const result = await this.repository.findOne({ where: { user_id: userId } })

      // contoh raw query
      const query = `SELECT * FROM users WHERE user_id = $1`;
      const data = await this.repository.query(query, [userId]);
      if (!data) {
        throw new Error('User not found');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(dto: CreateUserDto): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const query = `
          INSERT INTO users (username, email, password, role_id, full_name)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING user_id, username, email, role_id;
        `;

        const result = await manager.query(query, [
          dto.username,
          dto.email,
          dto.password,
          dto.role,
          dto.fullName,
        ]);

        if (result.length === 0) {
          throw new Error('Failed to insert user. No rows returned.');
        }

        const createdUser = result[0];
        console.log('User created successfully:', createdUser);
        return createdUser;
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Could not create user.');
    }
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const query = `
        UPDATE users
        SET failed_login_attempts = failed_login_attempts + 1
        WHERE user_id = $1;
      `;
      await manager.query(query, [userId]);
    });
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const query = `
        UPDATE users
        SET failed_login_attempts = 0
        WHERE user_id = $1;
      `;
      await manager.query(query, [userId]);
    });
  }

  async banUser(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const query = `
        UPDATE users
        SET is_banned = TRUE
        WHERE user_id = $1;
      `;
      await manager.query(query, [userId]);
    });
  }

  async findBannedUsers(): Promise<any[]> {
    try {
      const query = `
      SELECT user_id, username, email, role_id, is_banned
      FROM users
      WHERE is_banned = TRUE;
    `;
      const data = await this.dataSource.query(query);
      if (!data) {
        throw new Error('Cant find banned users');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    const result = await this.repository.findOneBy({ email });
    return result;
  }

  async findByUsername(username: string): Promise<Users | null> {
    const result = await this.repository.findOneBy({ username });
    return result;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const query = `
          UPDATE users
          SET 
            username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE($3, password),
            updated_at = NOW() AT TIME ZONE 'UTC' + interval '7 hours'
          WHERE user_id = $4
        `;

        const result = await manager.query(query, [
          updateUserDto.username,
          updateUserDto.email,
          updateUserDto.password,
          userId,
        ]);

        if (result.rowCount === 0) {
          throw new Error('User not found or no fields to update');
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
