import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateRoleDto } from '../dto/create-roles.dto';
import { UpdateRoleDto } from '../dto/update-roles.dto';
import { Roles } from '../entity/roles.entity';
import { RoleType } from '../../common/enums/user-roles.enum';

describe('RolesRepository', () => {
  describe('Query Methods', () => {
    let rolesRepository: RolesRepository;
    const mockRepository = { query: jest.fn() };
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RolesRepository,
          {
            provide: 'DB_POSTGRES',
            useValue: mockDataSource,
          },
        ],
      }).compile();

      rolesRepository = module.get<RolesRepository>(RolesRepository);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(rolesRepository).toBeDefined();
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

      it('should return roles and total count', async () => {
        const mockCount = [{ count: 2 }];
        mockRepository.query
          .mockResolvedValueOnce(mockRoles)
          .mockResolvedValueOnce(mockCount);

        const result = await rolesRepository.getRoles(0, 10);

        expect(mockRepository.query).toHaveBeenNthCalledWith(
          1,
          expect.any(String),
          [0, 10],
        );
        expect(mockRepository.query).toHaveBeenNthCalledWith(
          2,
          expect.any(String),
        );
        expect(result).toEqual([mockRoles, 2]);
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Query failed'));
        await expect(rolesRepository.getRoles(0, 10)).rejects.toThrow(
          'Query failed',
        );
      });
    });

    describe('getRoleById', () => {
      const mockRole: Roles = {
        roleId: '27c379e7-f614-4e22-b82d-cd92b1f567c3',
        roleType: RoleType.Admin,
        roleName: 'Administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      };

      it('should return a role by ID', async () => {
        mockRepository.query.mockResolvedValue([mockRole]);
        const result = await rolesRepository.getRoleById(mockRole.roleId);
        expect(result).toEqual(mockRole);
      });

      it('should return null if no role is found', async () => {
        mockRepository.query.mockResolvedValue([]);
        const result = await rolesRepository.getRoleById('non-existent-id');
        expect(result).toBeNull();
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Database Error'));
        await expect(rolesRepository.getRoleById('test-id')).rejects.toThrow(
          'Database Error',
        );
      });
    });

    describe('getRoleByName', () => {
      const mockRole: Roles = {
        roleId: '27c379e7-f614-4e22-b82d-cd92b1f567c3',
        roleType: RoleType.Operator,
        roleName: 'Basic User',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      };

      it('should return a role by name', async () => {
        mockRepository.query.mockResolvedValue([mockRole]);
        const result = await rolesRepository.getRoleByName(mockRole.roleName);
        expect(result).toEqual(mockRole);
      });

      it('should return null if no role is found', async () => {
        mockRepository.query.mockResolvedValue([]);
        const result = await rolesRepository.getRoleByName('NonExistentRole');
        expect(result).toBeNull();
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Database Error'));
        await expect(
          rolesRepository.getRoleByName('test-name'),
        ).rejects.toThrow('Database Error');
      });
    });

    describe('getBaseRole', () => {
      const mockRole: Roles = {
        roleId: '27c379e7-f614-4e22-b82d-cd92b1f567c3',
        roleType: RoleType.Operator,
        roleName: 'Base Role',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      };

      it('should return the base role', async () => {
        mockRepository.query.mockResolvedValue([mockRole]);
        const result = await rolesRepository.getBaseRole();
        expect(result).toEqual(mockRole);
      });

      it('should return null if no base role is found', async () => {
        mockRepository.query.mockResolvedValue([]);
        const result = await rolesRepository.getBaseRole();
        expect(result).toBeNull();
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Database Error'));
        await expect(rolesRepository.getBaseRole()).rejects.toThrow(
          'Database Error',
        );
      });
    });
  });

  describe('Transaction Methods', () => {
    let rolesRepository: RolesRepository;
    let dataSourceMock: Partial<DataSource>;
    let queryRunnerMock: Partial<QueryRunner>;

    beforeEach(() => {
      queryRunnerMock = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        query: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };

      dataSourceMock = {
        createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
        getRepository: jest.fn().mockReturnValue({}),
      };

      rolesRepository = new RolesRepository(dataSourceMock as DataSource);
      (rolesRepository as any).repository = {
        manager: {
          connection: {
            createQueryRunner: dataSourceMock.createQueryRunner,
          },
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createRole', () => {
      const createRoleDto: CreateRoleDto = {
        roleType: RoleType.Admin,
        roleName: 'Administrator',
        createdBy: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
      };

      it('should create a role and return its ID', async () => {
        const mockRoleId = ['0b5010ee-3472-4375-acb6-6941aad29efe'];
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(mockRoleId);

        const result = await rolesRepository.createRole(createRoleDto);

        expect(queryRunnerMock.connect).toHaveBeenCalled();
        expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          createRoleDto.roleType,
          createRoleDto.roleName,
          createRoleDto.createdBy,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
        expect(result).toBe(mockRoleId[0]);
      });

      it('should rollback transaction if creation fails', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Insert failed'),
        );

        await expect(rolesRepository.createRole(createRoleDto)).rejects.toThrow(
          'Insert failed',
        );

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });

    describe('updateRole', () => {
      const roleId = '0b5010ee-3472-4375-acb6-6941aad29efe';
      const updateRoleDto: UpdateRoleDto = {
        roleType: RoleType.Operator,
        roleName: 'Basic User',
        updatedBy: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
      };

      it('should update a role successfully', async () => {
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(undefined);

        await rolesRepository.updateRole(roleId, updateRoleDto);

        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          updateRoleDto.roleType,
          updateRoleDto.roleName,
          updateRoleDto.updatedBy,
          roleId,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction if update fails', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Update failed'),
        );

        await expect(
          rolesRepository.updateRole(roleId, updateRoleDto),
        ).rejects.toThrow('Update failed');

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });

    describe('deleteRole', () => {
      const roleId = '98c2703f-ba1a-4b83-a32f-083dddb2a50c';

      it('should delete a role successfully', async () => {
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(undefined);

        await rolesRepository.deleteRole(roleId);

        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          roleId,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction if delete fails', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Delete failed'),
        );

        await expect(rolesRepository.deleteRole(roleId)).rejects.toThrow(
          'Delete failed',
        );

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });
  });
});
