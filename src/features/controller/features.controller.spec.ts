import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesController } from './features.controller';
import { FeaturesService } from '../service/features.service';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Features } from '../entity/features.entity';
import { RoleType } from '../../common/enums/user-roles.enum';

describe('FeaturesController', () => {
  let controller: FeaturesController;
  let service: FeaturesService;

  const mockFeaturesService = {
    getFeatures: jest.fn(),
    getFeatureById: jest.fn(),
    getFeatureByName: jest.fn(),
    createFeature: jest.fn(),
    updateFeature: jest.fn(),
    deleteFeature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturesController],
      providers: [
        {
          provide: FeaturesService,
          useValue: mockFeaturesService,
        },
      ],
    }).compile();

    controller = module.get<FeaturesController>(FeaturesController);
    service = module.get<FeaturesService>(FeaturesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeatures', () => {
    it('should return features with pagination and status 200', async () => {
      const mockResult = {
        data: [
          {
            feature_id: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
            feature_name: 'FeatureTest1',
            menu_id: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
            description: 'FeatureTest1',
            active: true,
            created_at: '2024-12-13 06:40:07.967695',
            updated_at: '2024-12-13 06:40:07.967695',
            created_by: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            updated_by: null,
          },
          {
            feature_id: 'e4e61b1b-a6ec-4bfc-b91f-b418ae89f7b3',
            feature_name: 'FeatureTest2',
            menu_id: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
            description: 'FeatureTest2',
            active: true,
            created_at: '2024-12-13 06:42:18.615797',
            updated_at: '2024-12-13 06:42:18.615797',
            created_by: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
            updated_by: null,
          },
        ],
        metadata: { page: 1, limit: 10, totalPages: 1, totalItems: 2 },
      };

      mockFeaturesService.getFeatures.mockResolvedValue(mockResult);

      const result = await controller.getFeatures(1, 10);

      expect(service.getFeatures).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        data: mockResult.data,
        metadata: mockResult.metadata,
      });
    });

    it('should handle invalid pagination parameters', async () => {
      mockFeaturesService.getFeatures.mockRejectedValue(
        new BadRequestException('Invalid pagination parameters'),
      );

      await expect(controller.getFeatures(-1, -10)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.getFeatures).toHaveBeenCalledWith(-1, -10);
    });
  });

  describe('getFeatureById', () => {
    const mockFeature: Features = {
      featureId: '27c379e7-f614-4e22-b82d-cd92b1f567c3',
      featureName: 'FeatureTest4',
      menuId: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
      description: 'FeatureTest4',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      updatedBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
    };
    it('should return a feature by id with status 200', async () => {
      mockFeaturesService.getFeatureById.mockResolvedValue(mockFeature);
      const result = await controller.getFeatureById(
        '27c379e7-f614-4e22-b82d-cd92b1f567c3',
      );

      expect(service.getFeatureById).toHaveBeenCalledWith(
        '27c379e7-f614-4e22-b82d-cd92b1f567c3',
      );
      expect(result).toEqual({
        data: mockFeature,
      });
    });

    it('should throw NotFoundException when feature not found', async () => {
      mockFeaturesService.getFeatureById.mockRejectedValue(
        new NotFoundException('Feature not found'),
      );

      await expect(
        controller.getFeatureById('053d76eb-1913-423f-8bc3-1d22253226d6'),
      ).rejects.toThrow(NotFoundException);
      expect(service.getFeatureById).toHaveBeenCalledWith(
        '053d76eb-1913-423f-8bc3-1d22253226d6',
      );
    });
  });

  describe('getFeatureByName', () => {
    const mockFeature = {
      feature_id: 'e4e61b1b-a6ec-4bfc-b91f-b418ae89f7b3',
      feature_name: 'FeatureTest2',
      menu_id: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
      description: 'FeatureTest2',
      active: true,
      created_at: '2024-12-13 06:42:18.615797',
      updated_at: '2024-12-13 06:42:18.615797',
      created_by: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
      updated_by: null,
    };
    it('should return a feature by name with status 200', async () => {
      mockFeaturesService.getFeatureByName.mockResolvedValue(mockFeature);
      const result = await controller.getFeatureByName('FeatureTest2');

      expect(service.getFeatureByName).toHaveBeenCalledWith('FeatureTest2');
      expect(result).toEqual({
        data: mockFeature,
      });
    });

    it('should throw NotFoundException when feature name not found', async () => {
      mockFeaturesService.getFeatureByName.mockRejectedValue(
        new NotFoundException('Feature not found'),
      );

      await expect(controller.getFeatureByName('NonExistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getFeatureByName).toHaveBeenCalledWith('NonExistent');
    });
  });

  describe('createFeature', () => {
    const createFeatureDto: CreateFeatureDto = {
      featureName: 'FeatureTest5',
      menuId: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
      description: 'Ini feature test 5',
      active: true,
    };
    const mockUser: JwtPayload = {
      userId: '71c7ff42-210f-44b3-9741-98d1919b7fe8',
      username: 'User Test',
      email: 'test@example.com',
      roleName: 'Executive Test',
      roleType: RoleType.Executive,
      ipAddress: '1.1.1.1',
      deviceType: 'Web',
    };
    const mockCreatedFeature = {
      featureId: 'c6a3502d-b238-4c7d-9be1-806026a45c35',
      ...createFeatureDto,
    };

    it('should create a new feature with status 201', async () => {
      mockFeaturesService.createFeature.mockResolvedValue(mockCreatedFeature);

      const result = await controller.createFeature(createFeatureDto, mockUser);

      expect(service.createFeature).toHaveBeenCalledWith(
        createFeatureDto,
        mockUser.userId,
      );
      expect(result).toEqual({
        data: mockCreatedFeature,
      });
    });

    it('should throw BadRequestException when creating duplicate feature', async () => {
      mockFeaturesService.createFeature.mockRejectedValue(
        new BadRequestException('Feature name already exists'),
      );

      await expect(
        controller.createFeature(createFeatureDto, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(service.createFeature).toHaveBeenCalledWith(
        createFeatureDto,
        mockUser.userId,
      );
    });
  });

  describe('updateFeature', () => {
    const updateFeatureDto: UpdateFeatureDto = {
      featureName: 'FeatureTest5',
      menuId: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
      description: 'Ini feature test 5',
      active: true,
    };
    const mockUser: JwtPayload = {
      userId: '71c7ff42-210f-44b3-9741-98d1919b7fe8',
      username: 'User Test',
      email: 'test@example.com',
      roleName: 'Executive Test',
      roleType: RoleType.Executive,
      ipAddress: '1.1.1.1',
      deviceType: 'Web',
    };
    it('should update a feature with status 200', async () => {
      mockFeaturesService.updateFeature.mockResolvedValue(undefined);

      const result = await controller.updateFeature(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
        updateFeatureDto,
        mockUser,
      );

      expect(service.updateFeature).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
        updateFeatureDto,
        mockUser.userId,
      );
    });

    it('should throw NotFoundException when updating non-existent feature', async () => {
      mockFeaturesService.updateFeature.mockRejectedValue(
        new NotFoundException('Feature not found'),
      );

      await expect(
        controller.updateFeature(
          'c6a3502d-b238-4c7d-9be1-806026a45c35',
          updateFeatureDto,
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(service.updateFeature).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
        updateFeatureDto,
        mockUser.userId,
      );
    });
  });

  describe('deleteFeature', () => {
    it('should delete a feature with status 200', async () => {
      mockFeaturesService.deleteFeature.mockResolvedValue(undefined);

      const result = await controller.deleteFeature(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
      );

      expect(service.deleteFeature).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
      );
    });

    it('should throw NotFoundException when deleting non-existent feature', async () => {
      mockFeaturesService.deleteFeature.mockRejectedValue(
        new NotFoundException('Feature not found'),
      );

      await expect(
        controller.deleteFeature('c6a3502d-b238-4c7d-9be1-806026a45c35'),
      ).rejects.toThrow(NotFoundException);
      expect(service.deleteFeature).toHaveBeenCalledWith(
        'c6a3502d-b238-4c7d-9be1-806026a45c35',
      );
    });
  });
});
