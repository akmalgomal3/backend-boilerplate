import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../entity/user.entity';
import { UsersAuth } from '../entity/user-auth.entity';
import { format } from 'date-fns';

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
          WHERE user_id = $1
      `;

      const [user] = await this.repository.query(query, [userId]);

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
        error.message || 'Error getting user by id',
        error.status || 500,
      );
    }
  }

  async getUserAuthById(userId: string): Promise<UsersAuth> {
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
          WHERE user_id = $1
      `;

      const [user] = await this.repository.query(query, [userId]);

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
        error.message || 'Error getting user by id',
        error.status || 500,
      );
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
        createdBy,
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
        createdBy || user_id,
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

  async deleteUserAuth(userId: string): Promise<void> {
    try {
      const query = `DELETE
                     FROM users_auth
                     WHERE user_id = $1`;
      await this.repository.query(query, [userId]);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting user',
        error.status || 500,
      );
    }
  }

  async approveUser(
    userAuthId: string,
    approverId: string,
    roleId: string,
  ): Promise<Users> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userAuthInfo = await this.getUserAuthById(userAuthId);

      await queryRunner.query('DELETE FROM users_auth WHERE user_id = $1', [
        userAuthId,
      ]);

      const newUser = await queryRunner.query(
        `INSERT INTO users (email, username, full_name, password, role_id, birthdate, phone_number, user_id,
                            created_by, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate`,
        [
          userAuthInfo.email,
          userAuthInfo.username,
          userAuthInfo.fullName,
          userAuthInfo.password,
          roleId,
          userAuthInfo.birthdate,
          userAuthInfo.phoneNumber,
          userAuthInfo.userId,
          approverId,
          true,
        ],
      );

      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error approving user',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async banUser(userId: string, bannerId?: string): Promise<void> {
    try {
      const query = `UPDATE users
                     SET active     = false,
                         updated_by = $1,
                         updated_at = NOW()
                     WHERE user_id = $2`;
      await this.repository.query(query, [bannerId || userId, userId]);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error banning user',
        error.status || 500,
      );
    }
  }

  async updateUserPassword(userId: string, password: string): Promise<Users> {
    try {
      const query = `UPDATE users
                     SET password = $2, updated_by = $3, updated_at = NOW()
                     WHERE user_id = $1
                     RETURNING user_id as "userId", username, email, full_name as "fullName", phone_number as "phoneNumber", birthdate`;
      const user = await this.repository.query(query, [userId, password, userId]);

      return user[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user password',
        error.status || 500,
      );
    }
  }
}
