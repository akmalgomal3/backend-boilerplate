import { Test, TestingModule } from '@nestjs/testing';
import { MenusController } from './menus.controller';
import { MenusService } from '../service/menus.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { RoleType } from '../../common/enums/user-roles.enum';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

jest.mock('../service/menus.service');

const mockMenusService = {
  getMenus: jest.fn(),
  getMenuById: jest.fn(),
  getMenuByName: jest.fn(),
  createMenu: jest.fn(),
  updateMenu: jest.fn(),
  deleteMenu: jest.fn(),
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

describe('MenusController', () => {
  let menusService: MenusService;
  let menusController: MenusController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: mockMenusService,
        },
      ],
    }).compile();

    menusService = module.get<MenusService>(MenusService);
    menusController = module.get<MenusController>(MenusController);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getMenus', () => {
    it('should return paginated menus', async () => {
      const mockResult = {
        data: [
          {
            menuId: '91ccec39-5616-4090-9372-87f08b877352',
            menuName: 'Menu 1',
            parentMenuId: null,
            routePath: '/menu1',
            icon: null,
            hierarchyLevel: 1,
            description: 'Ini menu 1 update',
            active: true,
            createdAt: '2024-12-15T21:18:04.272Z',
            updatedAt: '2024-12-15T21:51:13.696Z',
            createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            updatedBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            children: [
              {
                menuId: '4c564485-eb52-4789-a4ff-a4124fb9684c',
                menuName: 'Menu 4',
                parentMenuId: '91ccec39-5616-4090-9372-87f08b877352',
                routePath: '/menu4',
                icon: null,
                hierarchyLevel: 2,
                description: 'Ini Menu 4',
                active: true,
                createdAt: '2024-12-15T21:20:17.305Z',
                updatedAt: '2024-12-15T21:20:17.305Z',
                createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
                updatedBy: null,
                children: [
                  {
                    menuId: '51532dff-660d-4fc1-9d87-1a427f088fee',
                    menuName: 'Menu 13',
                    parentMenuId: '4c564485-eb52-4789-a4ff-a4124fb9684c',
                    routePath: '/menu13',
                    icon: null,
                    hierarchyLevel: 3,
                    description: 'Ini Menu 13',
                    active: true,
                    createdAt: '2024-12-16T23:12:22.326Z',
                    updatedAt: '2024-12-16T23:12:22.326Z',
                    createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
                    updatedBy: null,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
        metadata: {
          page: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 7,
        },
      };

      mockMenusService.getMenus.mockResolvedValueOnce(mockResult);

      const result = await menusController.getMenus(1, 10);

      expect(menusService.getMenus).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.getMenus.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(menusController.getMenus(1, 10)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getMenuById', () => {
    it('should return menu by id', async () => {
      const mockMenu = {
        menuId: '91ccec39-5616-4090-9372-87f08b877352',
        menuName: 'Menu 1',
        parentMenuId: null,
        routePath: '/menu1',
        icon: null,
        hierarchyLevel: 1,
        description: 'Ini menu 1',
        active: true,
        createdAt: '2024-12-15T21:18:04.272Z',
        updatedAt: '2024-12-15T21:51:13.696Z',
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      };

      mockMenusService.getMenuById.mockResolvedValueOnce(mockMenu);

      const result = await menusController.getMenuById(
        '91ccec39-5616-4090-9372-87f08b877352',
      );

      expect(menusService.getMenuById).toHaveBeenCalledWith(
        '91ccec39-5616-4090-9372-87f08b877352',
      );
      expect(result).toEqual({ data: mockMenu });
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.getMenuById.mockRejectedValueOnce(
        new Error('Menu not found'),
      );

      await expect(menusController.getMenuById('invalid-id')).rejects.toThrow(
        'Menu not found',
      );
    });
  });

  describe('getMenuByName', () => {
    it('should return menu by name', async () => {
      const mockMenu = {
        menuId: '91ccec39-5616-4090-9372-87f08b877352',
        menuName: 'Menu 1',
        parentMenuId: null,
        routePath: '/menu1',
        icon: null,
        hierarchyLevel: 1,
        description: 'Ini menu 1',
        active: true,
        createdAt: '2024-12-15T21:18:04.272Z',
        updatedAt: '2024-12-15T21:51:13.696Z',
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      };

      mockMenusService.getMenuByName.mockResolvedValueOnce(mockMenu);

      const result = await menusController.getMenuByName('Menu 1');

      expect(menusService.getMenuByName).toHaveBeenCalledWith('Menu 1');
      expect(result).toEqual({ data: mockMenu });
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.getMenuByName.mockRejectedValueOnce(
        new Error('Menu not found'),
      );

      await expect(
        menusController.getMenuByName('Invalid Menu'),
      ).rejects.toThrow('Menu not found');
    });
  });

  describe('createMenu', () => {
    const createMenuDto: CreateMenuDto = {
      menuName: 'Menu 18',
      parentMenuId: '4c564485-eb54-4789-a4ff-a4124fb9664c',
      routePath: '/menu18',
      icon: null,
      hierarchyLevel: 3,
      description: 'Ini Menu 18',
      active: true,
    };

    const mockResult = {
      menuId: 'f267f7cb-c577-4db3-b4aa-9fb4bd91f0ba',
    };
    it('should create a new menu', async () => {
      mockMenusService.createMenu.mockResolvedValueOnce(mockResult);

      const result = await menusController.createMenu(createMenuDto, user);

      expect(menusService.createMenu).toHaveBeenCalledWith(
        createMenuDto,
        user.userId,
      );
      expect(result).toEqual({ data: mockResult });
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.createMenu.mockRejectedValueOnce(
        new Error('Creation failed'),
      );

      await expect(
        menusController.createMenu(createMenuDto, user),
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('updateMenu', () => {
    const updateMenuDto: UpdateMenuDto = {
      menuName: 'Updated Menu',
      description: 'Updated description',
    };
    it('should update a menu', async () => {
      mockMenusService.updateMenu.mockResolvedValueOnce(undefined);

      await menusController.updateMenu(
        '91ccec39-5616-4090-9372-87f08b877352',
        updateMenuDto,
        user,
      );

      expect(menusService.updateMenu).toHaveBeenCalledWith(
        '91ccec39-5616-4090-9372-87f08b877352',
        updateMenuDto,
        user.userId,
      );
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.updateMenu.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      await expect(
        menusController.updateMenu('invalid-id', { menuName: 'Test' }, user),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteMenu', () => {
    it('should delete a menu', async () => {
      mockMenusService.deleteMenu.mockResolvedValueOnce(undefined);

      await menusController.deleteMenu('91ccec39-5616-4090-9372-87f08b877352');

      expect(menusService.deleteMenu).toHaveBeenCalledWith(
        '91ccec39-5616-4090-9372-87f08b877352',
      );
    });

    it('should throw an error if service fails', async () => {
      mockMenusService.deleteMenu.mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(menusController.deleteMenu('invalid-id')).rejects.toThrow(
        'Delete failed',
      );
    });
  });
});
