import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UtilsService } from '../../common/utils/services/utils.service';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '../../libs/elasticsearch/services/elasticsearch.service';
import { ElasticsearchService as ElasticClient } from '@nestjs/elasticsearch';
import { GetBannedUsersDto } from '../dto/get-banned-users.dto';
import { DeviceType, UserRoles } from '../../common/enums/user.enum';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { of } from 'rxjs';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsers: jest.fn(),
            getBannedUsers: jest.fn(),
            subscribeToGetLoggedInUser: jest.fn(),
            getUserActivityLogs: jest.fn(),
            getUserAuthLogs: jest.fn(),
          },
        },
        UtilsService,
        ConfigService,
        ResponseInterceptor,
        {
          provide: ElasticsearchService,
          useClass: ElasticsearchService,
        },
        {
          provide: ElasticClient,
          useValue: {
            indices: {
              exists: jest.fn().mockResolvedValue(false),
              create: jest.fn().mockResolvedValue({}),
            },
            index: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue({
              hits: {
                hits: [],
                total: 0,
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return users', async () => {
      const result = {
        data: [
          {
            id: 'someid',
            username: 'someusername',
            email: 'some@gmail.com',
            role: UserRoles.Admin,
            ban_reason: 'Attempting 5 times',
            password: 'somepassword',
            failed_login_attempts: 3,
            is_banned: true,
            created_at: new Date(),
            updated_at: new Date(),
            sessions: [],
          },
        ],
        metadata: { page: 1, limit: 10, totalPages: 1, totalItems: 1 },
      };
      jest.spyOn(userService, 'getUsers').mockResolvedValue(result);

      const response = await controller.getUsers(1, 10);
      expect(response).toEqual({
        data: result.data,
        metadata: result.metadata,
      });
    });
  });

  it('should return banned users', async () => {
    const result = {
      data: [
        {
          id: 'someid',
          username: 'someusername',
          email: 'some@gmail.com',
          role: UserRoles.Admin,
          ban_reason: 'Attempting 5 times',
          password: 'somepassword',
          failed_login_attempts: 3,
          is_banned: true,
          created_at: new Date(),
          updated_at: new Date(),
          sessions: [],
        },
      ],
      metadata: { page: 1, limit: 10, totalPages: 1, totalItems: 1 },
    };
    jest.spyOn(userService, 'getBannedUsers').mockResolvedValue(result);

    const getBannedUsersDto: GetBannedUsersDto = {
      orderBy: 'username',
      orderIn: 'asc',
      page: 1,
      limit: 10,
    };
    const response = await controller.getBannedUsers(getBannedUsersDto);
    expect(response).toEqual({
      data: result.data,
      metadata: result.metadata,
    });
  });

  it('should listen to logged-in users', async () => {
    const user: JwtPayload = {
      id: 'someid',
      username: 'someusername',
      role: UserRoles.Admin,
      device_type: DeviceType.web,
      email: 'some@gmail.com',
      session_id: 'somesessionid',
      user_agent: 'Mozilla/5.0',
    };
    const loggedInUsers = [
      {
        id: 'someid',
        username: 'someusername',
        email: 'some@gmail.com',
        role: UserRoles.Admin,
        deviceType: DeviceType.web,
        lastActivity: new Date(),
        expiresAt: new Date(),
      },
    ];
    jest
      .spyOn(userService, 'subscribeToGetLoggedInUser')
      .mockReturnValue(of(loggedInUsers));

    const req = { user };
    const response = await controller.listenToLoggedInUsers(req).toPromise();
    expect(response).toEqual({ data: loggedInUsers });
  });

  it('should return user activity logs', async () => {
    const result = {
      hits: [
        {
          user_id: 'someid',
          user_role: UserRoles.Admin,
          username: 'someusername',
          method: 'GET',
          path: '/somepath',
          log_type: 'activity',
          status: 'success',
          activity: 'User logged in',
          timestamp: Date.now(),
          datetime: new Date(),
          device_type: 'web',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
          location: { lat: 0, lon: 0 },
          country: 'Country',
          city: 'City',
          postal_code: '12345',
          timezone: 'UTC',
        },
      ],
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 10,
    };
    jest.spyOn(userService, 'getUserActivityLogs').mockResolvedValue(result);

    const getUserActivityDto = {
      logType: 'activity',
      status: 'success' as 'success' | 'failed',
      userRole: UserRoles.Admin,
      dateTo: '2021-01-01',
      dateFrom: '2021-01-03',
      search: 'User logged in',
      username: 'someusername',
      limit: 10,
      page: 1,
    };
    const response = await controller.getUserActivity(getUserActivityDto);
    expect(response).toEqual({
      data: result.hits,
      metadata: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalItems: result.total,
      },
    });
  });
});
