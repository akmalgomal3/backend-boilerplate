import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RolesRepository } from '../repository/roles.repository';
import { NotFoundException, HttpException } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { RoleType } from '../../common/enums/user-roles.enum';
import { Roles } from '../entity/roles.entity';

const mockRolesRepository = {
  getRoles: jest.fn(),
  getRoleById: jest.fn(),
  getRoleByName: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  getBaseRole: jest.fn(),
};

describe('RolesService', () => {
  let rolesService: RolesService;
  let rolesRepository: RolesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    rolesService = module.get<RolesService>(RolesService);
    rolesRepository = module.get<RolesRepository>(RolesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    const mockRoles: Roles[] = [
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
    ];
    it('should return paginated roles', async () => {
      mockRolesRepository.getRoles.mockResolvedValueOnce([mockRoles, 2]);

      const result = await rolesService.getRoles({ page: 1, limit: 10 });

      expect(rolesRepository.getRoles).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({
        data: mockRoles,
        metadata: {
          page: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 2,
        },
      });
    });
  });

  describe('getRoleById', () => {
    const mockRole: Roles = {
      roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      roleType: RoleType.Admin,
      roleName: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      updatedBy: null,
    };
    it('should return a role by ID', async () => {
      mockRolesRepository.getRoleById.mockResolvedValueOnce(mockRole);

      const result = await rolesService.getRoleById(
        'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      );

      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(
        'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      );
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role is not found', async () => {
      mockRolesRepository.getRoleById.mockResolvedValueOnce(null);

      await expect(
        rolesService.getRoleById('d635b4d3-d962-4cbc-be48-3039fe7b53d1'),
      ).rejects.toThrow(NotFoundException);
      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(
        'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      );
    });
  });

  describe('getRoleByName', () => {
    const mockRole: Roles = {
      roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      roleType: RoleType.Admin,
      roleName: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      updatedBy: null,
    };
    it('should return a role by name', async () => {
      mockRolesRepository.getRoleByName.mockResolvedValueOnce(mockRole);

      const result = await rolesService.getRoleByName('Administrator');

      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith(
        'Administrator',
      );
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role is not found', async () => {
      mockRolesRepository.getRoleByName.mockResolvedValueOnce(null);

      await expect(rolesService.getRoleByName('Administrator')).rejects.toThrow(
        NotFoundException,
      );
      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith(
        'Administrator',
      );
    });
  });

  describe('createRole', () => {
    const createRoleDto: CreateRoleDto = {
      roleName: 'Admin',
      roleType: RoleType.Admin,
    };
    const userId = 'fbe5b72c-7658-48b3-9b05-108d04e9dc84';
    it('should create a new role', async () => {
      mockRolesRepository.getRoleByName.mockResolvedValueOnce(null);
      mockRolesRepository.createRole.mockResolvedValueOnce(
        '461881d1-c2c6-4edb-b6ad-23329322d049',
      );

      const result = await rolesService.createRole(createRoleDto, userId);

      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith('Admin');
      expect(rolesRepository.createRole).toHaveBeenCalledWith({
        ...createRoleDto,
        createdBy: userId,
      });
      expect(result).toEqual('461881d1-c2c6-4edb-b6ad-23329322d049');
    });

    it('should throw ConflictException if role name already exists', async () => {
      mockRolesRepository.getRoleByName.mockResolvedValueOnce({
        id: '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
        roleName: 'Admin',
      });

      await expect(
        rolesService.createRole(createRoleDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      roleName: 'Operator',
      roleType: RoleType.Operator,
    };
    const userId = 'fbe5b72c-7658-48b3-9b05-108d04e9dc84';
    it('should update an existing role', async () => {
      mockRolesRepository.getRoleById.mockResolvedValueOnce({
        id: '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
        roleName: 'Admin',
      });
      mockRolesRepository.getRoleByName.mockResolvedValueOnce(null);

      await rolesService.updateRole(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
        updateRoleDto,
        userId,
      );

      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
      );
      expect(rolesRepository.updateRole).toHaveBeenCalledWith(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
        {
          ...updateRoleDto,
          updatedBy: userId,
        },
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete a role by ID', async () => {
      mockRolesRepository.getRoleById.mockResolvedValueOnce({
        id: '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
        roleName: 'Admin',
      });

      await rolesService.deleteRole('10467ee5-9ac1-4cd9-b20c-c3aeabfcc982');

      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
      );
      expect(rolesRepository.deleteRole).toHaveBeenCalledWith(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
      );
    });

    it('should throw NotFoundException if role is not found', async () => {
      mockRolesRepository.getRoleById.mockResolvedValueOnce(null);

      await expect(
        rolesService.deleteRole('10467ee5-9ac1-4cd9-b20c-c3aeabfcc982'),
      ).rejects.toThrow(NotFoundException);
      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(
        '10467ee5-9ac1-4cd9-b20c-c3aeabfcc982',
      );
    });
  });

  describe('getBaseRole', () => {
    const mockRole: Roles = {
      roleId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
      roleType: RoleType.Admin,
      roleName: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      updatedBy: null,
    };
    it('should return the base role ID', async () => {
      mockRolesRepository.getBaseRole.mockResolvedValueOnce(mockRole);

      const result = await rolesService.getBaseRole();

      expect(rolesRepository.getBaseRole).toHaveBeenCalled();
      expect(result).toEqual('d635b4d3-d962-4cbc-be48-3039fe7b53d1');
    });

    it('should throw HttpException on failure', async () => {
      mockRolesRepository.getBaseRole.mockRejectedValueOnce(
        new Error('Error getting base role'),
      );

      await expect(rolesService.getBaseRole()).rejects.toThrow(HttpException);
    });
  });
});
