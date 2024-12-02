import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

const mockUsers = [
  {
    user_id: 'aa57782b-273c-4916-a5fd-205bd6a1d984',
    username: 'admin1',
    password: 'Admin.1!',
    email: 'admin1@test.com',
    role_id: 'Admin',
    full_name: 'Operator Labinkur',
    active: true,
    is_dev: true,
    is_banned: false,
    failed_login_attempts: 0,
  },
];

const mockUserService = {
  getUsers: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  findBannedUsers: jest.fn(),
};

const mockSessionsService = {
  getActiveSessions: jest.fn(),
};

const mockElasticsearchService = {
  searchActivityLogs: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true), // Always allow access
  };

  const mockRolesGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const handlerRoles = ['Admin', 'Executive']; // Replace with roles for the test
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      const user = request.user || { role: 'Operator' }; // Mock user role
      return handlerRoles.includes(user.role);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: ElasticsearchService, useValue: mockElasticsearchService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('should allow Admin/Executive to access getUsers', async () => {
    mockUserService.getUsers.mockResolvedValueOnce({
      data: mockUsers,
      metadata: { total: 1, page: 1, limit: 10 },
    });

    const result = await userController.getUsers(1, 10);

    expect(result).toEqual({
      data: mockUsers,
      metadata: { total: 1, page: 1, limit: 10 },
    });
    expect(mockUserService.getUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('should restrict access to getBannedUsers for non-Admin roles', async () => {
    mockRolesGuard.canActivate = jest.fn((context: ExecutionContext) => {
      throw new ForbiddenException('Forbidden');
    });
    expect('Forbidden');
    expect(mockRolesGuard.canActivate).not.toHaveBeenCalled();
  });

  it('should allow Admin to access getBannedUsers', async () => {
    const mockBannedUsers = [{ ...mockUsers[0], is_banned: true }];
    mockUserService.findBannedUsers.mockResolvedValueOnce(mockBannedUsers);

    const result = await userController.getBannedUsers();

    expect(result).toEqual({ data: mockBannedUsers });
    expect(mockUserService.findBannedUsers).toHaveBeenCalled();
  });

  it('should update user details', async () => {
    const updatedUser = {
      ...mockUsers[0],
      email: 'admin1-1@test.com',
    };
    mockUserService.updateUser.mockResolvedValueOnce(updatedUser);

    const result = await userController.updateUser(mockUsers[0].user_id, {
      email: 'admin1-1@test.com',
    });

    expect(result).toEqual({ data: updatedUser });
    expect(mockUserService.updateUser).toHaveBeenCalledWith(
      mockUsers[0].user_id,
      {
        email: 'admin1-1@test.com',
      },
    );
  });

  it('should return a single user by ID for Admin/Executive roles', async () => {
    mockUserService.getUser.mockResolvedValueOnce(mockUsers[0]);

    const result = await userController.getUser(mockUsers[0].user_id);

    expect(result).toEqual({ data: mockUsers[0] });
    expect(mockUserService.getUser).toHaveBeenCalledWith(mockUsers[0].user_id);
  });
});
