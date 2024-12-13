import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../entity/user.entity';
import { UsersAuth } from '../entity/user-auth.entity';

@Injectable()
export class UserRepository {
  private repository: Repository<Users>;
  private repositoryAuth: Repository<UsersAuth>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(Users);
    this.repositoryAuth = this.dataSource.getRepository(UsersAuth);
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
      const query = `
          SELECT user_id       as "userId",
                 username,
                 email,
                 password,
                 active,
                 full_name     as "fullName",
                 phone_number  as "phoneNumber",
                 birthdate,
                 roles.role_id as "roleId",
                 role_name     as "roleName",
                 role_type     as "roleType"
          FROM users
                   LEFT JOIN roles ON users.role_id = roles.role_id
          WHERE username = $1
      `;
      const [user] = await this.repository.query(query, [username]);

      return user
        ? {
            ...user,
            role: {
              roleId: user.roleId,
              roleName: user.roleName,
              roleType: user.roleType,
            },
          }
        : null;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserAuthByUsername(username: string): Promise<UsersAuth> {
    try {
      const query = `
          SELECT user_id       as "userId",
                 username,
                 email,
                 password,
                 active,
                 full_name     as "fullName",
                 phone_number  as "phoneNumber",
                 birthdate,
                 roles.role_id as "roleId",
                 role_name     as "roleName",
                 role_type     as "roleType"
          FROM users_auth
                   LEFT JOIN roles ON users_auth.role_id = roles.role_id
          WHERE username = $1
      `;
      const [user] = await this.repository.query(query, [username]);

      return user
        ? {
            ...user,
            role: {
              roleId: user.roleId,
              roleName: user.roleName,
              roleType: user.roleType,
            },
          }
        : null;
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

  async getUserAuthByEmail(email: string): Promise<UsersAuth> {
    try {
      const query = `SELECT *
                     FROM users_auth
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
      const user_id = uuidv4();
      const {
        email,
        username,
        fullName,
        password,
        roleId,
        birthdate,
        phoneNumber,
      } = createUserDto;

      const query = `INSERT INTO users (email, username, full_name, password, role_id, birthdate, phone_number, user_id,
                                        created_by, active, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                     RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate`;

      const data = await this.repository.query(query, [
        email,
        username,
        fullName,
        password,
        roleId,
        birthdate,
        phoneNumber,
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

  async createUserAuth(
    createUserDto: CreateUserDto,
    isActive: boolean = true,
  ): Promise<Users> {
    try {
      const user_id = uuidv4();
      const {
        email,
        username,
        fullName,
        password,
        roleId,
        birthdate,
        phoneNumber,
      } = createUserDto;

      const query = `INSERT INTO users_auth (email, username, full_name, password, role_id, birthdate, phone_number,
                                             user_id,
                                             created_by, active, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                     RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate`;

      const data = await this.repository.query(query, [
        email,
        username,
        fullName,
        password,
        roleId,
        birthdate,
        phoneNumber,
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

  async getUnapprovedUsers(
    take: number,
    skip: number,
    search: string,
    sortDate: 'DESC' | 'ASC',
  ): Promise<[UsersAuth[], number]> {
    try {
      return await this.repositoryAuth.findAndCount({
        where: {
          ...(search && {
            username: Like(`%${search}%`),
          }),
        },
        take,
        skip,
        order: {
          createdAt: sortDate,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting unapproved users',
        error.status || 500,
      );
    }
  }
}
