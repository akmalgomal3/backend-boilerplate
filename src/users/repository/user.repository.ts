import { Inject, Injectable } from '@nestjs/common';
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
      const data = await this.repository.query(query, [userId]);
      if (!data) {
        throw new Error('User not found');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(dto: CreateUserDto): Promise<void> {}

  async updateUser(userId: string, dto: UpdateUserDto): Promise<void> {}

  async deleteUser(userId: string): Promise<void> {}
}
