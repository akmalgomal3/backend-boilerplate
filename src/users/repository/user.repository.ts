import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../entity/user.entity';
import { UsersAuth } from '../entity/user-auth.entity';
import { Roles } from 'src/roles/entity/roles.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserAuthRequestType } from '../../common/enums/request-type.enum';
import { ErrorMessages } from '../../common/exceptions/root-error.message';
import { SessionService } from 'src/libs/session/service/session.service';
import { UserLogActivitiesService } from 'src/user_log_activities/service/user_log_activities.service';
import { DeviceType } from 'src/common/enums/device-type.enum';
import { UserQuery } from '../query/user.query';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { BulkUpdateUserDto } from '../dto/bulk-update-user.dto';

@Injectable()
export class UserRepository {
  private repository: Repository<Users>;
  private repositoryAuth: Repository<UsersAuth>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
    private sessionService: SessionService,
    private userLogActivitiesService: UserLogActivitiesService,
    private utilsService: UtilsService,
  ) {
    this.repository = this.dataSource.getRepository(Users);
    this.repositoryAuth = this.dataSource.getRepository(UsersAuth);
  }

  async getUsers(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[UsersAuth[], number]> {
    try {
      return await this.utilsService.getAllQuery(
        skip,
        take,
        filters,
        sorts,
        searchQuery,
        'users',
        this.repository,
        [
          {
            table: 'roles',
            alias: 'role',
            condition: 'users.role_id = role.role_id',
          },
        ],
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting unapproved users',
        error.status || 500,
      );
    }
  }

  async getUserById(userId: string): Promise<Users> {
    try {
      const user = await this.repository.findOne({
        where: {
          userId,
        },
        relations: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by id',
        error.status || 500,
      );
    }
  }

  async getUserAuthById(userId: string): Promise<UsersAuth> {
    try {
      const userAuth = await this.repositoryAuth.findOne({
        where: {
          userId,
        },
        relations: {
          role: true,
        },
      });

      return userAuth;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by id',
        error.status || 500,
      );
    }
  }

  async getUserByUsername(username: string): Promise<Users> {
    try {
      const user = await this.repository.findOne({
        where: {
          username,
        },
        relations: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserAuthByUsername(username: string): Promise<UsersAuth> {
    try {
      const user = await this.repositoryAuth.findOne({
        where: {
          username,
        },
        relations: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserByIds(userIds: string[]): Promise<Users[]> {
    try {
      const users = await this.repository.findBy({
        userId: In(userIds),
      });

      return users;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by ids',
        error.status || 500,
      );
    }
  }

  async getUserByUsernames(usernames: string[]): Promise<Users[]> {
    try {
      const users = await this.repository.findBy({
        username: In(usernames),
      });

      return users;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by usernames',
        error.status || 500,
      );
    }
  }

  async getUserByEmail(email: string): Promise<Users> {
    try {
      const user = await this.repository.findOne({
        where: {
          email,
        },
        relations: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async getUserAuthByEmail(email: string): Promise<UsersAuth> {
    try {
      const userAuth = await this.repositoryAuth.findOne({
        where: {
          email,
        },
        relations: {
          role: true,
        },
      });

      return userAuth;
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

      const user = await this.repository.save({
        email,
        username,
        password,
        fullName,
        phoneNumber,
        birthdate,
        role: {
          roleId,
        },
        createdBy,
        active: isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return user;
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
      const userId = uuidv4();
      const {
        email,
        username,
        fullName,
        password,
        roleId,
        birthdate,
        phoneNumber,
      } = createUserDto;

      const userAuth = await this.repositoryAuth.save({
        userId,
        email,
        username,
        password,
        fullName,
        phoneNumber,
        birthdate,
        role: {
          roleId,
        },
        active: isActive,
        requestStatus: UserAuthRequestType.Requested,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return userAuth;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating user',
        error.status || 500,
      );
    }
  }

  async updateUserAuthStatus(
    userAuthId: string,
    updaterId: string,
    requestStatus: UserAuthRequestType,
  ): Promise<UsersAuth> {
    try {
      await this.repositoryAuth.update(
        {
          userId: userAuthId,
        },
        {
          requestStatus,
          updatedBy: updaterId,
          updatedAt: new Date(),
        },
      );

      return await this.getUserAuthById(userAuthId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error declining user',
        error.status || 500,
      );
    }
  }

  async getUserAuth(
    skip: number,
    take: number,
    filters: any[],
    sorts: any[],
    searchQuery: any,
  ): Promise<[UsersAuth[], number]> {
    try {
      return await this.utilsService.getAllQuery(
        skip,
        take,
        filters,
        sorts,
        searchQuery,
        'user_auth',
        this.repositoryAuth,
        [
          {
            table: 'roles',
            alias: 'role',
            condition: 'user_auth.role_id = role.role_id',
          },
        ],
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting unapproved users',
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

      const userAuthInfo = await queryRunner.manager.findOne(UsersAuth, {
        where: { userId: userAuthId },
        relations: { role: true },
      });
      if (!userAuthInfo) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_AUTH_NOT_FOUND'),
        );
      }

      if (userAuthInfo.requestStatus !== UserAuthRequestType.Requested) {
        throw new BadRequestException(
          `User already ${userAuthInfo.requestStatus}`,
        );
      }

      await queryRunner.manager.update(
        UsersAuth,
        { userId: userAuthId },
        {
          requestStatus: UserAuthRequestType.Approved,
          updatedBy: approverId,
          updatedAt: new Date(),
        },
      );

      const newUser = await queryRunner.manager.save(Users, {
        email: userAuthInfo.email,
        username: userAuthInfo.username,
        fullName: userAuthInfo.fullName,
        password: userAuthInfo.password,
        role: { roleId },
        birthdate: userAuthInfo.birthdate,
        phoneNumber: userAuthInfo.phoneNumber,
        createdBy: approverId,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await queryRunner.commitTransaction();

      return await this.getUserById(newUser.userId);
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

  async updateUserBan(
    userId: string,
    updatedBy?: string,
    isActive: boolean = false,
  ): Promise<void> {
    try {
      await this.repository.update(
        {
          userId,
        },
        {
          active: isActive,
          updatedBy,
          updatedAt: new Date(),
        },
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error banned user',
        error.status || 500,
      );
    }
  }

  async updateUserPassword(
    userId: string,
    password: string,
    updaterId: string,
  ): Promise<Partial<Users>> {
    try {
      await this.repository.update(
        {
          userId,
        },
        {
          password,
          updatedBy: updaterId,
          updatedAt: new Date(),
        },
      );

      const user = await this.getUserById(userId);

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user password',
        error.status || 500,
      );
    }
  }

  async updateUserAuthEmail(
    userAuthId: string,
    email: string,
  ): Promise<Partial<UsersAuth>> {
    try {
      await this.repositoryAuth.update(
        {
          userId: userAuthId,
        },
        {
          email,
          updatedAt: new Date(),
          updatedBy: userAuthId,
        },
      );

      const user = await this.getUserAuthById(userAuthId);

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user email',
        error.status || 500,
      );
    }
  }

  async updateUserEmail(
    userId: string,
    email: string,
  ): Promise<Partial<Users>> {
    try {
      await this.repository.update(
        {
          userId,
        },
        {
          email,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      );

      const user = await this.getUserById(userId);

      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user email',
        error.status || 500,
      );
    }
  }

  async updateUserAuthByUserId(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UsersAuth>> {
    try {
      await this.repositoryAuth.update(
        {
          userId,
        },
        {
          role: {
            roleId: updateUserDto.roleId,
          },
          username: updateUserDto.username,
          fullName: updateUserDto.fullName,
          birthdate: updateUserDto.birthdate,
          updatedBy: updateUserDto.updatedBy,
          updatedAt: new Date(),
        },
      );

      const userAuth = await this.getUserAuthById(userId);
      return {
        userId: userAuth.userId,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user email',
        error.status || 500,
      );
    }
  }

  async updateUserById(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<Users>> {
    try {
      await this.repository.update(
        {
          userId,
        },
        {
          role: {
            roleId: updateUserDto.roleId,
          },
          username: updateUserDto.username,
          fullName: updateUserDto.fullName,
          birthdate: updateUserDto.birthdate,
          updatedBy: updateUserDto.updatedBy,
          updatedAt: new Date(),
        },
      );

      const user = await this.getUserById(userId);
      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user',
        error.status || 500,
      );
    }
  }

  async bulkUpdateUser(userData: BulkUpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const repository = queryRunner.manager.getRepository(Users);

      for (const user of userData.users) {
        await repository.update(
          {
            userId: user.userId,
          },
          {
            role: {
              roleId: user.roleId,
            },
            username: user.username,
            fullName: user.fullName,
            birthdate: user.birthdate,
            updatedBy: user.updatedBy,
            updatedAt: new Date(),
          },
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Bulk update success',
      };
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

  async deleteUserAuth(userAuthId: string): Promise<void> {
    try {
      await this.repositoryAuth.delete({
        userId: userAuthId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting user',
        error.status || 500,
      );
    }
  }

  async hardDeleteUserByUserId(
    userId: string,
    username: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.deleteTrxUserByUserId(queryRunner, userId);

      const userAuth = await this.getUserAuthByUsername(username);
      if (userAuth && userAuth?.userId) {
        await this.deleteTrxUserAuthById(queryRunner, userAuth?.userId);
      }

      await Promise.all([
        this.sessionService.deleteSession(
          `session:${userId}:${DeviceType.WEB}`,
        ),
        this.sessionService.deleteSession(
          `refresh:${userId}:${DeviceType.WEB}`,
        ),
        this.sessionService.deleteSession(
          `session:${userId}:${DeviceType.MOBILE}`,
        ),
        this.sessionService.deleteSession(
          `refresh:${userId}:${DeviceType.MOBILE}`,
        ),
        await this.userLogActivitiesService.deleteUserActivityByUserId(userId),
      ]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message || 'Error hard delete user',
        error.status || 500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTrxUserAuthById(
    trx: QueryRunner,
    userAuthId: string,
  ): Promise<void> {
    try {
      await trx.manager.delete(UsersAuth, {
        userId: userAuthId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete user auth',
        error.status || 500,
      );
    }
  }

  async deleteTrxUserByUserId(trx: QueryRunner, userId: string): Promise<void> {
    try {
      await trx.manager.delete(Users, {
        userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete user',
        error.status || 500,
      );
    }
  }
}
