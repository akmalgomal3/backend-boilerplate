import { Test, TestingModule } from '@nestjs/testing';
import { MenusService } from './menus.service';
import { MenusRepository } from '../repository/menus.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Menu } from '../entity/menus.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

describe('MenusService', () => {
  let service: MenusService;
  let repository: MenusRepository;

  const mockMenusRepository = {
    getMenus: jest.fn(),
    getMenuById: jest.fn(),
    getMenuByName: jest.fn(),
    createMenu: jest.fn(),
    updateMenu: jest.fn(),
    deleteMenu: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        {
          provide: MenusRepository,
          useValue: mockMenusRepository,
        },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
    repository = module.get<MenusRepository>(MenusRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return 200 get hierarchical menus data', async () => {
    const mockMenus = [
      { menuId: 1, menuName: 'Dashboard', parentMenuId: null },
      { menuId: 2, menuName: 'Reports', parentMenuId: 1 },
    ];
    const mockTotalItems = 2;

    mockMenusRepository.getMenus.mockResolvedValue([mockMenus, mockTotalItems]);

    const result = await service.getMenus(1, 10);

    expect(repository.getMenus).toHaveBeenCalledWith(0, 10);
    expect(result).toEqual({
      data: [
        {
          menuId: 1,
          menuName: 'Dashboard',
          parentMenuId: null,
          children: [
            { menuId: 2, menuName: 'Reports', parentMenuId: 1, children: [] },
          ],
        },
      ],
      metadata: {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 2,
      },
    });
  });

  it('should throw 409 when an error occurs', async () => {
    mockMenusRepository.getMenus.mockRejectedValue(new Error('Database error'));

    await expect(service.getMenus(1, 10)).rejects.toThrow(HttpException);
  });

  it('should return a 200 menu by ID', async () => {
    const mockMenu: Menu = {
      menuId: 'f1cf0c15-7d4b-466b-8cd9-989c9855d062',
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
    };

    mockMenusRepository.getMenuById.mockResolvedValue(mockMenu);

    const result = await service.getMenuById(
      'f1cf0c15-7d4b-466b-8cd9-989c9855d062',
    );
    expect(result).toEqual(mockMenu);
  });

  it('should throw a 404 error if menu not found', async () => {
    const mockMenu: Menu = null;
    mockMenusRepository.getMenuById.mockResolvedValue(mockMenu);

    try {
      await service.getMenuById('f1cf0c15-7d4b-466b-8cd9-989c9855d062');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(e.message).toBe(
        'NotFoundException: Menu with ID f1cf0c15-7d4b-466b-8cd9-989c9855d062 not found',
      );
    }
  });

  it('should throw a 409 error if there is a service conflict & Database error', async () => {
    mockMenusRepository.getMenuById.mockRejectedValue(
      new Error('Database Error'),
    );

    try {
      await service.getMenuById('1');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(e.message).toBe('Failed to retrieve menus, Error: Database Error');
    }
  });

  it('should return 200 a menu by name', async () => {
    const mockMenu: Menu = {
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
    };

    mockMenusRepository.getMenuByName.mockResolvedValue(mockMenu);

    const result = await service.getMenuByName('Dashboard');
    expect(result).toEqual(mockMenu);
  });

  it('should throw a 404 error if menu not found', async () => {
    mockMenusRepository.getMenuByName.mockResolvedValue(null);

    try {
      await service.getMenuByName('NonExistentMenu');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(e.message).toBe(
        'NotFoundException: Menu with name NonExistentMenu not found',
      );
    }
  });

  it('should throw a 409 error if there is a service conflict', async () => {
    mockMenusRepository.getMenuByName.mockRejectedValue(
      new Error('Database Error'),
    );

    try {
      await service.getMenuByName('Dashboard');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(e.message).toBe('Failed to retrieve menus, Error: Database Error');
    }
  });

  it('should 200 create a menu and return menuId', async () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'Test Menu',
      parentMenuId: null,
      routePath: '/test',
      icon: 'icon-test',
      hierarchyLevel: 1,
      description: 'Test Description',
      active: true,
    };
    const userId = 'user-123';
    const mockMenuId = 'menu-456';

    mockMenusRepository.createMenu.mockResolvedValue(mockMenuId);

    const result = await service.createMenu(createMenuDto, userId);

    expect(result).toBe(mockMenuId);
    expect(mockMenusRepository.createMenu).toHaveBeenCalledWith(
      expect.objectContaining(createMenuDto),
      userId,
    );
  });

  it('should throw 409 if createMenu fails', async () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'Test Menu',
      parentMenuId: null,
      routePath: '/test',
      icon: 'icon-test',
      hierarchyLevel: 1,
      description: 'Test Description',
      active: true,
    };
    const userId = 'user-123';

    mockMenusRepository.createMenu.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.createMenu(createMenuDto, userId)).rejects.toThrow(
      new HttpException(
        'Failed to create menus, Error: Database error',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('should 200 create a new menu successfully', async () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'New Menu',
      parentMenuId: null,
      routePath: '/new-menu',
      icon: 'icon-new',
      hierarchyLevel: 1,
      description: 'New Menu Description',
      active: true,
    };
    const userId = 'user-123';
    const menuId = 'menu-456';

    mockMenusRepository.createMenu.mockResolvedValue(menuId);

    const result = await service.createMenu(createMenuDto, userId);

    expect(mockMenusRepository.createMenu).toHaveBeenCalledWith(
      { ...createMenuDto, active: true },
      userId,
    );
    expect(result).toBe(menuId);
  });

  it('should throw ConflictException on repository failure', async () => {
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

    mockMenusRepository.createMenu.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.createMenu(createMenuDto, userId)).rejects.toThrow(
      HttpException,
    );
  });

  it('should 200 update a menu successfully', async () => {
    const menuId = 'menu-123';
    const userId = 'user-456';
    const updateMenuDto: UpdateMenuDto = { menuName: 'Updated Menu' };

    jest.spyOn(service, 'getMenuById').mockResolvedValueOnce({} as Menu);
    mockMenusRepository.updateMenu.mockResolvedValueOnce(undefined);

    await service.updateMenu(menuId, updateMenuDto, userId);

    expect(service.getMenuById).toHaveBeenCalledWith(menuId);
    expect(mockMenusRepository.updateMenu).toHaveBeenCalledWith(
      menuId,
      updateMenuDto,
      userId,
    );
  });

  it('should throw 404 Failed to update menu if menu does not exist', async () => {
    const menuId = 'menu-123';
    const userId = 'user-456';
    const updateMenuDto: UpdateMenuDto = { menuName: 'Updated Menu' };

    jest
      .spyOn(service, 'getMenuById')
      .mockRejectedValueOnce(
        new HttpException('Failed to update menu', HttpStatus.NOT_FOUND),
      );

    await expect(
      service.updateMenu(menuId, updateMenuDto, userId),
    ).rejects.toThrow(
      new HttpException('Failed to update menu', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw 409 Failed to update menu on repository failure', async () => {
    const menuId = 'menu-123';
    const userId = 'user-456';
    const updateMenuDto: UpdateMenuDto = { menuName: 'Updated Menu' };

    jest.spyOn(service, 'getMenuById').mockResolvedValueOnce({} as Menu);
    mockMenusRepository.updateMenu.mockRejectedValueOnce(
      new Error('Database error'),
    );

    await expect(
      service.updateMenu(menuId, updateMenuDto, userId),
    ).rejects.toThrow(
      new HttpException('Failed to update menu', HttpStatus.CONFLICT),
    );
  });

  it('should 200 delete a menu successfully', async () => {
    const menuId = 'menu-123';

    jest.spyOn(service, 'getMenuById').mockResolvedValueOnce({} as Menu);
    mockMenusRepository.deleteMenu.mockResolvedValueOnce(undefined);

    await service.deleteMenu(menuId);

    expect(service.getMenuById).toHaveBeenCalledWith(menuId);
    expect(mockMenusRepository.deleteMenu).toHaveBeenCalledWith(menuId);
  });

  it('should throw 404 Failed to update menu if menu does not exist', async () => {
    const menuId = 'menu-123';

    jest
      .spyOn(service, 'getMenuById')
      .mockRejectedValueOnce(
        new HttpException('Failed to delete menu', HttpStatus.NOT_FOUND),
      );

    await expect(service.deleteMenu(menuId)).rejects.toThrow(
      new HttpException('Failed to delete menu', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw 409 Failed to delete menu menu on repository failure', async () => {
    const menuId = 'menu-123';

    jest.spyOn(service, 'getMenuById').mockResolvedValueOnce({} as Menu);
    mockMenusRepository.deleteMenu.mockRejectedValueOnce(
      new Error('Database error'),
    );

    await expect(service.deleteMenu(menuId)).rejects.toThrow(
      new HttpException('Failed to delete menu', HttpStatus.CONFLICT),
    );
  });

  it('should build a menu hierarchy correctly', () => {
    const menus: Menu[] = [
      { menuId: '1', parentMenuId: null, menuName: 'Root 1' } as Menu,
      { menuId: '2', parentMenuId: '1', menuName: 'Child 1.1' } as Menu,
      { menuId: '3', parentMenuId: '1', menuName: 'Child 1.2' } as Menu,
      { menuId: '4', parentMenuId: null, menuName: 'Root 2' } as Menu,
      { menuId: '5', parentMenuId: '4', menuName: 'Child 2.1' } as Menu,
    ];

    const expectedHierarchy: any = [
      {
        menuId: '1',
        parentMenuId: null,
        menuName: 'Root 1',
        children: [
          {
            menuId: '2',
            parentMenuId: '1',
            menuName: 'Child 1.1',
            children: [],
          },
          {
            menuId: '3',
            parentMenuId: '1',
            menuName: 'Child 1.2',
            children: [],
          },
        ],
      },
      {
        menuId: '4',
        parentMenuId: null,
        menuName: 'Root 2',
        children: [
          {
            menuId: '5',
            parentMenuId: '4',
            menuName: 'Child 2.1',
            children: [],
          },
        ],
      },
    ];

    const result = service['buildMenuHierarchy'](menus);

    expect(result).toEqual(expectedHierarchy);
  });
});
