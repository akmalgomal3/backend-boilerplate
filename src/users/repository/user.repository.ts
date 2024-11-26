import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
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

  async getUserById(userId: string): Promise<Users | null> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE id = $1`;
      const data: Users[] = await this.repository.query(query, [userId]);

      if (!data.length) {
        throw new NotFoundException('User not found');
      }
      return data[0];
    } catch (error) {
      throw error;
    }
  }

  async isExist(username: string, email: string): Promise<boolean> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE username = $1
                        OR email = $2`;

      const data: Users[] = await this.repository.query(query, [
        username,
        email,
      ]);

      if (data.length) {
        return true;
      }

      return false;
    } catch (e) {
      throw e;
    }
  }

  async createUser(dto: CreateUserDto): Promise<Users> {
    try {
      const { username, email, password, role } = dto;

      const query = `INSERT INTO users (username, email, password, role)
                     VALUES ($1, $2, $3, $4) RETURNING *`;
      const users: Users[] = await this.repository.query(query, [
        username,
        email,
        password,
        role,
      ]);

      return users[0];
    } catch (e) {
      throw e;
    }
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<void> {}

  async deleteUser(userId: string): Promise<void> {}
}
