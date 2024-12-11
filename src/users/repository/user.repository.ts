import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Like, MoreThan, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Users } from '../entity/user.entity';
import { UserWithSessions } from '../../common/types/user.type';

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

  async addFailedLoginAttempts(userId: string): Promise<void> {
    try {
      const query = `UPDATE users
                     SET failed_login_attempts = failed_login_attempts + 1
                     WHERE id = $1`;
      await this.repository.query(query, [userId]);
    } catch (e) {
      throw e;
    }
  }

  async banUser(userId: string, reason: string): Promise<void> {
    try {
      const query = `UPDATE users
                     SET is_banned  = true,
                         ban_reason = $2
                     WHERE id = $1`;
      await this.repository.query(query, [userId, reason]);
    } catch (e) {
      throw e;
    }
  }

  async setFailedLoginAttemptsToZero(userId: string): Promise<void> {
    try {
      const query = `UPDATE users
                     SET failed_login_attempts = 0
                     WHERE id = $1`;
      await this.repository.query(query, [userId]);
    } catch (e) {
      throw e;
    }
  }

  async updateUserPassword(userId: string, password: string): Promise<Users> {
    try {
      const query = `UPDATE users
                     SET password = $2
                     WHERE id = $1
                     returning *`;
      const user = await this.repository.query(query, [userId, password]);

      return user[0];
    } catch (e) {
      throw e;
    }
  }

  async createUser(dto: CreateUserDto): Promise<Users> {
    try {
      const { username, email, password, role } = dto;

      const query = `INSERT INTO users (username, email, password, role)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`;
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

  async getUserByIdentifier(identifier: string): Promise<Users> {
    try {
      const query = `SELECT *
                     FROM users
                     WHERE username = $1
                        OR email = $1`;
      const users: Users[] = await this.repository.query(query, [identifier]);

      if (!users.length) {
        throw new NotFoundException('Invalid username / email');
      }

      return {
        ...users[0],
      };
    } catch (error) {
      throw error;
    }
  }

  async getBannedUsers(
    skip: number,
    take: number,
    orderBy: string,
    orderIn: 'desc' | 'asc',
    search: string | null,
  ): Promise<[Users[], number]> {
    try {
      return await this.repository.findAndCount({
        skip,
        take,
        where: {
          is_banned: true,
          username: search ? Like(`%${search}%`) : undefined,
          email: search ? Like(`%${search}%`) : undefined,
        },
        order: { [orderBy]: orderIn },
        select: ['id', 'username', 'email', 'role', 'ban_reason'],
      });
    } catch (e) {
      throw e;
    }
  }

  async getLoginUser(): Promise<UserWithSessions[]> {
    try {
      const users: Users[] = await this.repository.find({
        where: {
          sessions: {
            expires_at: MoreThan(new Date()),
            last_activity: MoreThan(new Date(Date.now() - 15 * 60 * 1000)),
          },
        },
        relations: ['sessions'],
      });

      return users;
    } catch (e) {
      throw e;
    }
  }
}
