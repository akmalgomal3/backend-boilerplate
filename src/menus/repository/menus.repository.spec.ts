import { Test, TestingModule } from '@nestjs/testing';
import { MenusRepository } from './menus.repository';
import { Menu } from '../entity/menus.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { UpdateMenuDto } from '../dto/update-menu.dto';

const mockDataSource = {
  getRepository: jest.fn(),
};

const mockRepository = {
  query: jest.fn(),
};

describe('MenusRepository', () => {
  let menusRepository: MenusRepository;

  beforeEach(async () => {
    mockDataSource.getRepository.mockReturnValue(mockRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusRepository,
        {
          provide: 'DB_POSTGRES',
          useValue: mockDataSource,
        },
      ],
    }).compile();

    menusRepository = module.get<MenusRepository>(MenusRepository);
  });

  it('should be defined', () => {
    expect(menusRepository).toBeDefined();
  });

  // getMenus
  it('should return menus and total count', async () => {
    const mockMenus = [
      { menuId: 1, menuName: 'Dashboard', parentMenuId: null },
      { menuId: 2, menuName: 'Settings', parentMenuId: null },
    ];
    const mockCount = [{ count: '2' }];

    (mockRepository.query as jest.Mock)
      .mockResolvedValueOnce(mockMenus)
      .mockResolvedValueOnce(mockCount);

    const result = await menusRepository.getMenus(0, 10);

    expect(mockRepository.query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      [0, 10],
    );
    expect(mockRepository.query).toHaveBeenNthCalledWith(2, expect.any(String));
    expect(result).toEqual([mockMenus, 2]);
  });

  it('should throw an error if query fails', async () => {
    (mockRepository.query as jest.Mock).mockRejectedValue(
      new Error('Query failed'),
    );

    await expect(menusRepository.getMenus(0, 10)).rejects.toThrow(
      'Query failed',
    );
  });

  //getMenuById
  it('should return a menu by ID', async () => {
    const mockMenu: Menu[] = [
      {
        menuId: '1',
        menuName: 'Dashboard',
        parentMenuId: null,
        routePath: '/dashboard',
        icon: 'icon-dashboard',
        hierarchyLevel: 1,
        description: 'Main dashboard',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
      },
    ];

    (mockRepository.query as jest.Mock).mockResolvedValue(mockMenu); // Mock SQL query

    const result = await menusRepository.getMenuById('1');
    expect(result).toEqual(mockMenu[0]);
  });

  it('should return null if no menu is found', async () => {
    (mockRepository.query as jest.Mock).mockResolvedValue([]); // Mock empty result from query

    const result = await menusRepository.getMenuById('1');
    expect(result).toBeNull();
  });

  it('should throw an error if query fails', async () => {
    (mockRepository.query as jest.Mock).mockRejectedValue(
      new Error('Database Error'),
    );

    try {
      await menusRepository.getMenuById('1');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Database Error');
    }
  });

  //getMenuByName
  it('should return a menu by name', async () => {
    const mockMenu: Menu[] = [
      {
        menuId: '1',
        menuName: 'Dashboard',
        parentMenuId: null,
        routePath: '/dashboard',
        icon: 'icon-dashboard',
        hierarchyLevel: 1,
        description: 'Main dashboard',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
      },
    ];

    (mockRepository.query as jest.Mock).mockResolvedValue(mockMenu); // Mock SQL query

    const result = await menusRepository.getMenuByName('Dashboard');
    expect(result).toEqual(mockMenu[0]);
  });

  it('should return null if no menu is found', async () => {
    (mockRepository.query as jest.Mock).mockResolvedValue([]); // Mock empty result from query

    const result = await menusRepository.getMenuByName('NonExistentMenu');
    expect(result).toBeNull();
  });

  it('should throw an error if query fails', async () => {
    (mockRepository.query as jest.Mock).mockRejectedValue(
      new Error('Database Error'),
    );

    try {
      await menusRepository.getMenuByName('Dashboard');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Database Error');
    }
  });
});

describe('MenusRepository - create, update, and delete menu', () => {
  let menusRepository: MenusRepository;
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

    menusRepository = new MenusRepository(dataSourceMock as DataSource);

    (menusRepository as any).repository = {
      manager: {
        connection: {
          createQueryRunner: dataSourceMock.createQueryRunner,
        },
      },
    };
  });

  // Create Menu
  it('should create a menu and return its ID', async () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'Test Menu',
      parentMenuId: null,
      routePath: '/test-path',
      icon: 'icon-test',
      hierarchyLevel: 1,
      description: 'Test description',
      active: true,
    };
    const userId = 'user-123';
    const mockMenuId = [{ menuId: 'menu-456' }];

    (queryRunnerMock.query as jest.Mock).mockResolvedValueOnce(mockMenuId);

    const result = await menusRepository.createMenu(createMenuDto, userId);

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
      createMenuDto.menuName,
      createMenuDto.parentMenuId,
      createMenuDto.routePath,
      createMenuDto.icon,
      createMenuDto.hierarchyLevel,
      createMenuDto.description,
      createMenuDto.active,
      userId,
    ]);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
    expect(result).toEqual(mockMenuId[0]);
  });

  it('should rollback transaction on failure', async () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'Test Menu',
      parentMenuId: null,
      routePath: '/test-path',
      icon: 'icon-test',
      hierarchyLevel: 1,
      description: 'Test description',
      active: true,
    };
    const userId = 'user-123';

    (queryRunnerMock.query as jest.Mock).mockRejectedValueOnce(
      new Error('Insert failed'),
    );

    await expect(
      menusRepository.createMenu(createMenuDto, userId),
    ).rejects.toThrow('Insert failed');

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  // Update Menu
  it('should update a menu successfully', async () => {
    const menuId = 'menu-123';
    const userId = 'user-456';
    const updateMenuDto: UpdateMenuDto = {
      menuName: 'Updated Menu',
      parentMenuId: null,
      routePath: '/updated-path',
      icon: 'updated-icon',
      hierarchyLevel: 2,
      description: 'Updated description',
      active: false,
    };

    (queryRunnerMock.query as jest.Mock).mockResolvedValueOnce(undefined);

    await menusRepository.updateMenu(menuId, updateMenuDto, userId);

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
      updateMenuDto.menuName,
      updateMenuDto.parentMenuId,
      updateMenuDto.routePath,
      updateMenuDto.icon,
      updateMenuDto.hierarchyLevel,
      updateMenuDto.description,
      updateMenuDto.active,
      userId,
      menuId,
    ]);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it('should rollback transaction if update fails', async () => {
    const menuId = 'menu-123';
    const userId = 'user-456';
    const updateMenuDto: UpdateMenuDto = {
      menuName: 'Updated Menu',
    };

    (queryRunnerMock.query as jest.Mock).mockRejectedValueOnce(
      new Error('Update failed'),
    );

    await expect(
      menusRepository.updateMenu(menuId, updateMenuDto, userId),
    ).rejects.toThrow('Update failed');

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  // Delete Menu
  it('should delete a menu successfully', async () => {
    const menuId = 'menu-123';

    (queryRunnerMock.query as jest.Mock).mockResolvedValueOnce(undefined);

    await menusRepository.deleteMenu(menuId);

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
      menuId,
    ]);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it('should rollback transaction if delete fails', async () => {
    const menuId = 'menu-123';

    (queryRunnerMock.query as jest.Mock).mockRejectedValueOnce(
      new Error('Delete failed'),
    );

    await expect(menusRepository.deleteMenu(menuId)).rejects.toThrow(
      'Delete failed',
    );

    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });
});
