import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
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

@Injectable()
export class UserRepository {
  private repository: Repository<Users>;
  private repositoryAuth: Repository<UsersAuth>;

  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
    private sessionService: SessionService,
    private userLogActivitiesService: UserLogActivitiesService,
  ) {
    this.repository = this.dataSource.getRepository(Users);
    this.repositoryAuth = this.dataSource.getRepository(UsersAuth);
  }

  async getUsers(skip: number, take: number): Promise<[Users[], number]> {
    try {
      const result = await this.repository.findAndCount({
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: { roleId: true, roleName: true, roleType: true },
        },
        relations: { role: true },
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
      const query = UserQuery.GET_USER_BY_USER_ID(userId);
      const [user] = await this.repository.query(query);
      return user
        ? {
            userId: user.userId,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            active: user.active,
            birthdate: user.birthdate,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            updatedAt: user.updatedAt, 
            updatedBy: user.updatedBy,
            phoneNumber: user.phoneNumber,
            role: {
              roleId: user.roleId,
              roleName: user.roleName,
              roleType: user.roleType,
              createdAt: user.createdAt,  
              createdBy: user.createdBy,
              updatedAt: user.updatedAt,
              updatedBy: user.updatedBy,
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
      const query = UserQuery.GET_USER_AUTH_BY_USER_ID(userId);
      const [user] = await this.repository.query(query);

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
      const query = UserQuery.GET_USER_BY_USERNAME(username);
      const [user] = await this.repository.query(query);

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
      const query = UserQuery.GET_USER_AUTH_BY_USERNAME(username);
      const [user] = await this.repository.query(query);

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
      const query = UserQuery.GET_USER_BY_EMAIL(email);
      const [user] = await this.repository.query(query);

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
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async getUserAuthByEmail(email: string): Promise<UsersAuth> {
    try {
      const query = UserQuery.GET_USER_AUTH_BY_EMAIL(email);
      const data = await this.repository.query(query);

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
      // const user_id = uuidv4();
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

      const query = UserQuery.CREATE_USER(
        email,
        username,
        password,
        fullName,   
        phoneNumber,
        birthdate,
        roleId,
        createdBy,
        isActive
      )

      const data = await this.repository.query(query);

      return data[0]
        ? {
            ...data[0],
            role: {
              roleId: data[0].roleId,
            },
          }
        : {};
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

      const query = UserQuery.CREATE_USER_AUTH(
        userId,
        email,
        username,
        fullName,
        password, 
        roleId, 
        birthdate,
        phoneNumber, 
        'Requested', 
        userId, 
        isActive
      )
      const data = await this.repository.query(query);

      return data[0]
        ? {
            ...data[0],
            role: {
              roleId: data[0].roleId,
            },
          }
        : {};
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
      const query = UserQuery.UPDATE_USER_AUTH_STATUS(
        userAuthId,
        updaterId,
        requestStatus,  
      )
      const [data] = await this.repository.query(query);
      return data[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error declining user',
        error.status || 500,
      );
    }
  }

  async getUserAuth(
    take: number,
    skip: number,
    search: string,
    sortDate: 'DESC' | 'ASC',
    requestType?: UserAuthRequestType,
  ): Promise<[UsersAuth[], number]> {
    try {
      return await this.repositoryAuth.findAndCount({
        where: {
          ...(search && {
            username: Like(`%${search}%`),
          }),
          ...(requestType && {
            requestStatus: requestType,
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

      await this.updateUserAuthStatus(
        userAuthInfo.userId,
        approverId,
        UserAuthRequestType.Approved,
      );

      const queryCreateUser = UserQuery.CREATE_USER(
        userAuthInfo.email,
        userAuthInfo.username,
        userAuthInfo.password,
        userAuthInfo.fullName,
        userAuthInfo.phoneNumber,
        userAuthInfo.birthdate,
        roleId,
        approverId,
        true,
      )
      const newUser = await queryRunner.query(queryCreateUser);
      await queryRunner.commitTransaction();

      return newUser[0];
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
      const query = UserQuery.UPDATE_USER_BAN(userId, updatedBy, isActive);
      await this.repository.query(query);
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
  ): Promise<Users> {
    try {
      const query = UserQuery.UPDATE_USER_PASSWORD(userId, updaterId, password);
      const user = await this.repository.query(query);

      return user[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user password',
        error.status || 500,
      );
    }
  }

  async updateUserAuthEmail(userAuthId: string, email: string): Promise<Users> {
    try {
      const query = UserQuery.UPDATE_USER_AUTH_EMAIL_BY_ID(userAuthId, email);
      const user = await this.repository.query(query);

      return user[0];
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user email',
        error.status || 500,
      );
    }
  }

  async updateUserEmail(userId: string, email: string): Promise<Users> {
    try {
      const query = UserQuery.UPDATE_USER_EMAIL_BY_USER_ID(userId, email);
      const user = await this.repository.query(query, [userId, email, userId]);

      return user[0];
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
  ): Promise<UsersAuth> {
    try {
      const query = UserQuery.UPDATE_USER_AUTH_BY_USER_ID(
        userId,
        updateUserDto.roleId,
        updateUserDto.username,
        updateUserDto.fullName,
        updateUserDto.birthdate,
        updateUserDto.updatedBy,
      );

      await this.repositoryAuth.query(query)
      return await this.getUserAuthById(userId);
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
  ): Promise<Users> {
    try {
      const query = UserQuery.UPDATE_USER_BY_USER_ID(
        userId,
        updateUserDto.roleId,
        updateUserDto.username,
        updateUserDto.fullName,
        updateUserDto.birthdate,
        updateUserDto.updatedBy,
      )

      await this.repository.query(query);
      return await this.getUserById(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating user',
        error.status || 500,
      );
    }
  }

  async deleteUserAuth(userAuthId: string): Promise<void> {
    try {
      const query = UserQuery.DELETE_USER_AUTH_BY_ID(userAuthId);
      await this.repository.query(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting user',
        error.status || 500,
      );
    }
  }

  async hardDeleteUserByUserId(userId: string, username: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.deleteTrxUserByUserId(queryRunner, userId)

      const userAuth = await this.getUserAuthByUsername(username);
      if(userAuth && userAuth?.userId){
        await this.deleteTrxUserAuthById(queryRunner, userAuth?.userId)
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
      ]);

      await this.userLogActivitiesService.deleteUserActivityByUserId(userId)
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
      const query = UserQuery.DELETE_USER_AUTH_BY_ID(userAuthId);
      await trx.query(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete user auth',
        error.status || 500,
      );
    }
  }

  async deleteTrxUserByUserId(
    trx: QueryRunner,
    userId: string,
  ): Promise<void> {
    try {
      const query = UserQuery.DELETE_USER_BY_USER_ID(userId);
      await trx.query(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error delete user',
        error.status || 500,
      );
    }
  }
}
