import { Test, TestingModule } from '@nestjs/testing';
import { MenusController } from './menus.controller';
import { MenusService } from '../service/menus.service';
import { Menu } from '../entity/menus.entity';
import * as request from 'supertest';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

jest.mock('../service/menus.service');

describe('MenusController', () => {
  let app: INestApplication;
  let menusService: jest.Mocked<MenusService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: {
            getMenus: jest.fn(),
            getMenuById: jest.fn(),
            getMenuByName: jest.fn(),
            createMenu: jest.fn(),
          },
        },
      ],
    }).compile();

    menusService = module.get(MenusService);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /menus - should return paginated menus with status 200', async () => {
    const mockResponse: PaginatedResponseDto<Menu> = {
      data: [
        {
          menuId: `f1cf0c15-7d4b-466b-8cd9-989c9855d062`,
          menuName: 'Dashboard',
          parentMenuId: null,
          routePath: '/dashboard',
          icon: 'icon-dashboard',
          hierarchyLevel: 1,
          description: 'Main dashboard',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
          updatedBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
        },
      ],
      metadata: {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 1,
      },
    };

    menusService.getMenus.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/menus?page=1&limit=10')
      .set('Authorization', 'Bearer token')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('metadata');
        expect(res.body.data).toHaveLength(1);
        expect(res.body.metadata).toEqual({
          page: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 1,
        });
      });
  });

  it('GET /menus - should return 500 if service throws error', async () => {
    menusService.getMenus.mockRejectedValue(new Error('Service failed'));

    return request(app.getHttpServer())
      .get('/menus?page=1&limit=10')
      .set('Authorization', 'Bearer token')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 500);
        expect(res.body).toHaveProperty('message');
      });
  });

  it('GET /menus/:menuId - should return a menu by ID with status 200', async () => {
    const mockMenu: Menu = {
      menuId: `f1cf0c15-7d4b-466b-8cd9-989c9855d062`,
      menuName: 'Dashboard',
      parentMenuId: null,
      routePath: '/dashboard',
      icon: 'icon-dashboard',
      hierarchyLevel: 1,
      description: 'Main dashboard',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
      updatedBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
    };

    menusService.getMenuById.mockResolvedValue(mockMenu);

    return request(app.getHttpServer())
      .get('/menus/f1cf0c15-7d4b-466b-8cd9-989c9855d062')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNmQ3Y2EyZC0yNDQ5LTQ0YWUtYThmMi03YjZlY2NiNGJiZjAiLCJ1c2VybmFtZSI6Imxha3VuYSIsImVtYWlsIjoibGFrdW5hQGdtYWlsLmNvbSIsInJvbGVOYW1lIjoiYWRtaW4gZGV2Iiwicm9sZVR5cGUiOiJBZG1pbiIsImlwQWRkcmVzcyI6IjEzOS4yNTUuMjU1LjI0MiIsImRldmljZVR5cGUiOiJXZWIiLCJpYXQiOjE3MzQ0MTk0NzEsImV4cCI6MTczNDQyMzA3MX0.OrMrJLaB2PArCtYmOWyiNwusB4NbBH5wqpqXYQM19nM',
      )
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toEqual({
          ...mockMenu,
          createdAt: mockMenu.createdAt.toISOString(),
          updatedAt: mockMenu.updatedAt.toISOString(),
        });
      });
  });

  it('GET /menus/:menuId - should return 500 if menu not found & service throws conflict error', async () => {
    menusService.getMenuById.mockRejectedValue({
      response: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    });

    return request(app.getHttpServer())
      .get('/menus/f1cf0c15-7d4b-466b-8cd9-989c9855d062')
      .set('Authorization', 'Bearer token')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          'statusCode',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(res.body).toHaveProperty('message', 'Internal server error');
      });
  });

  it('GET /menus/:menuName - should return 200 if a menu found by name', async () => {
    const mockMenu = {
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
      createdBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
      updatedBy: 'ccbc3658-9ec4-498a-9a04-46f9853ac4c0',
    };

    menusService.getMenuByName.mockResolvedValue(mockMenu);

    return request(app.getHttpServer())
      .get('/menus/name/Dashboard')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNmQ3Y2EyZC0yNDQ5LTQ0YWUtYThmMi03YjZlY2NiNGJiZjAiLCJ1c2VybmFtZSI6Imxha3VuYSIsImVtYWlsIjoibGFrdW5hQGdtYWlsLmNvbSIsInJvbGVOYW1lIjoiYWRtaW4gZGV2Iiwicm9sZVR5cGUiOiJBZG1pbiIsImlwQWRkcmVzcyI6IjEzOS4yNTUuMjU1LjI0MiIsImRldmljZVR5cGUiOiJXZWIiLCJpYXQiOjE3MzQ0MTk0NzEsImV4cCI6MTczNDQyMzA3MX0.OrMrJLaB2PArCtYmOWyiNwusB4NbBH5wqpqXYQM19nM',
      )
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toEqual({
          ...mockMenu,
          createdAt: mockMenu.createdAt.toISOString(),
          updatedAt: mockMenu.updatedAt.toISOString(),
        });
      });
  });

  it('GET /menus/:menuName - should return a 500 error if menu by name not found & service throws database error', async () => {
    menusService.getMenuByName.mockRejectedValue({
      response: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    });

    return request(app.getHttpServer())
      .get('/menus/name/Dashboard')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNmQ3Y2EyZC0yNDQ5LTQ0YWUtYThmMi03YjZlY2NiNGJiZjAiLCJ1c2VybmFtZSI6Imxha3VuYSIsImVtYWlsIjoibGFrdW5hQGdtYWlsLmNvbSIsInJvbGVOYW1lIjoiYWRtaW4gZGV2Iiwicm9sZVR5cGUiOiJBZG1pbiIsImlwQWRkcmVzcyI6IjEzOS4yNTUuMjU1LjI0MiIsImRldmljZVR5cGUiOiJXZWIiLCJpYXQiOjE3MzQ0MTk0NzEsImV4cCI6MTczNDQyMzA3MX0.OrMrJLaB2PArCtYmOWyiNwusB4NbBH5wqpqXYQM19nM',
      )
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          'statusCode',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(res.body).toHaveProperty('message', 'Internal server error');
      });
  });
});

describe('MenusController (e2e)', () => {
  let app: INestApplication;
  const menusService = {
    createMenu: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: {
            getMenus: jest.fn(),
            getMenuById: jest.fn(),
            getMenuByName: jest.fn(),
            createMenu: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();

    // Add a mock middleware to inject userId into request.user
    app.use((req, res, next) => {
      req.user = { userId: 'mock-user-id-123' };
      next();
    });

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /menus - should create a new menu', async () => {
    const createMenuDto = {
      menuName: 'Test Menu',
      parentMenuId: null,
      routePath: '/test',
      icon: 'icon-test',
      hierarchyLevel: 1,
      description: 'Test Menu Description',
      active: true,
    };
    const mockMenuId = 'menu-id-123';

    menusService.createMenu.mockResolvedValue(mockMenuId);

    return request(app.getHttpServer())
      .post('/menus')
      .set('Authorization', 'Bearer token')
      .send(createMenuDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toBe(mockMenuId);
      });
  });
});
