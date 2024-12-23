import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from '../service/roles.service';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { RoleType } from '../../common/enums/user-roles.enum';

const mockRolesService = {
  getRoles: jest.fn(),
  getRoleById: jest.fn(),
  getRoleByName: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
};

describe('RolesController', () => {
  let rolesController: RolesController;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    rolesController = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return paginated roles', async () => {
      const mockResult = {
        data: [
          {
            roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
            roleType: RoleType.Admin,
            roleName: 'Administrator',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            updatedBy: null,
          },
          {
            roleId: 'e4e61b1b-a6ec-4bfc-b91f-b418ae89f7b3',
            roleType: RoleType.Operator,
            roleName: 'Basic Operator',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            updatedBy: null,
          },
        ],
        metadata: { page: 1, limit: 10, totalPages: 1, totalItems: 2 },
      };
      mockRolesService.getRoles.mockResolvedValueOnce(mockResult);

      const result = await rolesController.getRoles(1, 10);

      expect(rolesService.getRoles).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if service fails', async () => {
      mockRolesService.getRoles.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(rolesController.getRoles(1, 10)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const mockRole: Roles = {
        roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
        roleType: RoleType.Admin,
        roleName: 'Administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      };
      mockRolesService.getRoleById.mockResolvedValueOnce(mockRole);

      const result = await rolesController.getRoleById(
        'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      );

      expect(rolesService.getRoleById).toHaveBeenCalledWith(
        'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      );
      expect(result).toEqual({ data: mockRole });
    });

    it('should throw an error if role not found', async () => {
      mockRolesService.getRoleById.mockRejectedValueOnce(
        new Error('Role not found'),
      );

      await expect(
        rolesController.getRoleById('d635b4d3-d962-4cbc-be48-3039fe7b53d1'),
      ).rejects.toThrow('Role not found');
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      const mockRole: Roles = {
        roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
        roleType: RoleType.Admin,
        roleName: 'Administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      };
      mockRolesService.getRoleByName.mockResolvedValueOnce(mockRole);

      const result = await rolesController.getRoleByName('Administrator');

      expect(rolesService.getRoleByName).toHaveBeenCalledWith('Administrator');
      expect(result).toEqual({ data: mockRole });
    });

    it('should throw an error if role not found', async () => {
      mockRolesService.getRoleByName.mockRejectedValueOnce(
        new Error('Role not found'),
      );

      await expect(
        rolesController.getRoleByName('Administrator'),
      ).rejects.toThrow('Role not found');
    });
  });

  describe('createRole', () => {
    const createRoleDto: CreateRoleDto = {
      roleName: 'Admin',
      roleType: RoleType.Admin,
    };
    const user: JwtPayload = {
      userId: '71c7ff42-210f-44b3-9741-98d1919b7fe8',
      username: 'User Test',
      email: 'test@example.com',
      roleName: 'Executive Test',
      roleType: RoleType.Executive,
      ipAddress: '1.1.1.1',
      deviceType: 'Web',
    };
    const mockResult = 'c6a3502d-b238-4c7d-9be1-806026a45c35';
    it('should create a new role', async () => {
      mockRolesService.createRole.mockResolvedValueOnce(mockResult);

      const result = await rolesController.createRole(createRoleDto, user);

      expect(rolesService.createRole).toHaveBeenCalledWith(
        createRoleDto,
        user.userId,
      );
      expect(result).toEqual({ data: mockResult });
    });

    it('should throw an error if service fails', async () => {
      mockRolesService.createRole.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(
        rolesController.createRole(createRoleDto, user),
      ).rejects.toThrow('Service error');
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      roleName: 'Admin',
      roleType: RoleType.Admin,
    };
    const user: JwtPayload = {
      userId: '71c7ff42-210f-44b3-9741-98d1919b7fe8',
      username: 'User Test',
      email: 'test@example.com',
      roleName: 'Executive Test',
      roleType: RoleType.Executive,
      ipAddress: '1.1.1.1',
      deviceType: 'Web',
    };
    const mockResult = 'c6a3502d-b238-4c7d-9be1-806026a45c35';
    it('should update an existing role', async () => {
      mockRolesService.updateRole.mockResolvedValueOnce(mockResult);

      const result = await rolesController.updateRole(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
        updateRoleDto,
        user,
      );

      expect(rolesService.updateRole).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
        updateRoleDto,
        user.userId,
      );
      expect(result).toEqual({ data: mockResult });
    });

    it('should throw an error if role not found', async () => {
      mockRolesService.updateRole.mockRejectedValueOnce(
        new Error('Role not found'),
      );

      await expect(
        rolesController.updateRole(
          'c6a3502d-b238-4c7d-9be1-806026a45c35',
          updateRoleDto,
          user,
        ),
      ).rejects.toThrow('Role not found');
    });

    it('should throw an error if service fails', async () => {
      mockRolesService.updateRole.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(
        rolesController.updateRole(
          'c6a3502d-b238-4c7d-9be1-806026a45c35',
          updateRoleDto,
          user,
        ),
      ).rejects.toThrow('Service error');
    });
  });

  describe('deleteRole', () => {
    it('should delete a role by ID', async () => {
      mockRolesService.deleteRole.mockResolvedValueOnce(undefined);

      const result = await rolesController.deleteRole(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
      );

      expect(rolesService.deleteRole).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
      );
      expect(result).toEqual({ data: undefined });
    });

    it('should throw an error if role not found', async () => {
      mockRolesService.deleteRole.mockRejectedValueOnce(
        new Error('Role not found'),
      );

      await expect(
        rolesController.deleteRole('c6a3502d-b238-4c7d-9be1-806026a45c35'),
      ).rejects.toThrow('Role not found');
    });

    it('should throw an error if service fails', async () => {
      mockRolesService.deleteRole.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(
        rolesController.deleteRole('c6a3502d-b238-4c7d-9be1-806026a45c35'),
      ).rejects.toThrow('Service error');
    });
  });
});
