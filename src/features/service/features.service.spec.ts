import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesService } from './features.service';
import { FeaturesRepository } from '../repository/features.repository';
import { MenusRepository } from '../../menus/repository/menus.repository';
import { Features } from '../entity/features.entity';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let repository: FeaturesRepository;

  const mockFeaturesRepository = {
    getFeatures: jest.fn(),
    getFeatureById: jest.fn(),
    getFeatureByName: jest.fn(),
    createFeature: jest.fn(),
    updateFeature: jest.fn(),
    deleteFeature: jest.fn(),
  };

  const mockMenusRepository = {
    getMenuById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        {
          provide: FeaturesRepository,
          useValue: mockFeaturesRepository,
        },
        {
          provide: MenusRepository,
          useValue: mockMenusRepository,
        },
      ],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
    repository = module.get<FeaturesRepository>(FeaturesRepository);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getFeatures', () => {
    const mockFeatures = [
      {
        featureId: 'd635b4d3-d962-4cbc-be48-3039fe7b53d1',
        featureName: 'FeatureTest1',
        menuId: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
        description: 'FeatureTest1',
        active: true,
        createdAt: '2024-12-13 06:40:07.967695',
        updatedAt: '2024-12-13 06:40:07.967695',
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      },
      {
        featureId: 'e4e61b1b-a6ec-4bfc-b91f-b418ae89f7b3',
        featureName: 'FeatureTest2',
        menuId: '63de07b6-0b18-4ebb-ac20-cb670c0443fa',
        description: 'FeatureTest2',
        active: true,
        createdAt: '2024-12-13 06:42:18.615797',
        updatedAt: '2024-12-13 06:42:18.615797',
        createdBy: '06d7ca2d-2449-44ae-a8f2-7b6eccb4bbf0',
        updatedBy: null,
      },
    ];

    const pagination = new PaginationDto();
    pagination.page = 1;
    pagination.limit = 10;

    it('should return features data with pagination', async () => {
      const mockTotalItems = 2;

      mockFeaturesRepository.getFeatures.mockResolvedValue([
        mockFeatures,
        mockTotalItems,
      ]);
      const result = await service.getFeatures(pagination, '');

      expect(repository.getFeatures).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({
        data: mockFeatures,
        metadata: {
          page: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 2,
        },
      });
    });

    it('should throw HttpException when database error occurs', async () => {
      mockFeaturesRepository.getFeatures.mockRejectedValue(
        new Error('Database error'),
      );
      await expect(service.getFeatures(pagination, '')).rejects.toThrow(
        HttpException,
      );
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

    it('should return a feature by ID', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(mockFeature);
      const result = await service.getFeatureById(mockFeature.featureId);
      expect(result).toEqual(mockFeature);
    });

    it('should throw NotFoundException when feature not found', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(null);
      const nonExistentId = 'f1cf0c15-7d4b-466b-8cd9-989c9855d062';

      await expect(service.getFeatureById(nonExistentId)).rejects.toThrow(
        new HttpException(
          `Feature with ID ${nonExistentId} not found`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw HttpException when database error occurs', async () => {
      mockFeaturesRepository.getFeatureById.mockRejectedValue(
        new Error('Database Error'),
      );

      await expect(service.getFeatureById('test-id')).rejects.toThrow(
        new HttpException('Failed to retrieve feature', HttpStatus.CONFLICT),
      );
    });
  });

  describe('getFeatureByName', () => {
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

    it('should return a feature by name', async () => {
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(mockFeature);
      const result = await service.getFeatureByName(mockFeature.featureName);
      expect(result).toEqual(mockFeature);
    });

    it('should throw NotFoundException when feature name not found', async () => {
      const nonExistentName = 'NonExistentFeature';
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(null);

      await expect(service.getFeatureByName(nonExistentName)).rejects.toThrow(
        new HttpException(
          `Feature with name ${nonExistentName} not found`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('createFeature', () => {
    const createFeatureDto: CreateFeatureDto = {
      featureName: 'Feature Test',
      menuId: '4ed8d6b6-0779-41b9-baca-ec6526abad1f',
      description: 'Ini Feature Testing',
    };
    const userId = 'eb8e1c02-4446-4ff5-ada6-a408ee8b3496';

    it('should create a feature and return featureId', async () => {
      const mockFeatureId = 'e944ee1d-432c-41f0-941b-214888790eda';

      mockMenusRepository.getMenuById.mockResolvedValue(
        createFeatureDto.menuId,
      );
      mockFeaturesRepository.createFeature.mockResolvedValue(mockFeatureId);
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(null);

      const result = await service.createFeature(createFeatureDto, userId);
      expect(result).toBe(mockFeatureId);
    });

    it('should throw ConflictException when feature name already exists', async () => {
      mockFeaturesRepository.getFeatureByName.mockResolvedValue({
        featureId: 'existing-id',
      });

      await expect(
        service.createFeature(createFeatureDto, userId),
      ).rejects.toThrow(
        new HttpException(
          `Feature with name ${createFeatureDto.featureName} already available!`,
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should throw NotFoundException when menu does not exist', async () => {
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(null);
      mockMenusRepository.getMenuById.mockResolvedValue(null);

      await expect(
        service.createFeature(createFeatureDto, userId),
      ).rejects.toThrow(
        new NotFoundException(
          `Menu with id ${createFeatureDto.menuId} not exist!`,
        ),
      );
    });
  });

  describe('updateFeature', () => {
    const mockFeatureId = 'e944ee1d-432c-41f0-941b-214888790eda';
    const updateFeatureDto: UpdateFeatureDto = {
      featureName: 'Feature Test',
      menuId: '4ed8d6b6-0779-41b9-baca-ec6526abad1c',
      description: 'Ini Feature Testing',
    };
    const userId = 'eb8e1c02-4446-4ff5-ada6-a408ee8b3496';

    it('should update a feature successfully', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(mockFeatureId);
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(null);
      mockMenusRepository.getMenuById.mockResolvedValue(
        updateFeatureDto.menuId,
      );
      mockFeaturesRepository.updateFeature.mockResolvedValue(mockFeatureId);

      await expect(
        service.updateFeature(mockFeatureId, updateFeatureDto, userId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException when feature does not exist', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(null);

      await expect(
        service.updateFeature(mockFeatureId, updateFeatureDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when feature name is already taken', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(mockFeatureId);
      mockFeaturesRepository.getFeatureByName.mockResolvedValue(
        updateFeatureDto,
      );

      await expect(
        service.updateFeature(mockFeatureId, updateFeatureDto, userId),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteFeature', () => {
    const mockFeatureId = 'e944ee1d-432c-41f0-941b-214888790eda';

    it('should delete a feature successfully', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(mockFeatureId);
      mockFeaturesRepository.deleteFeature.mockResolvedValue(undefined);

      await expect(service.deleteFeature(mockFeatureId)).resolves.not.toThrow();
    });

    it('should throw NotFoundException when feature does not exist', async () => {
      mockFeaturesRepository.getFeatureById.mockRejectedValue(
        new NotFoundException('Feature not found'),
      );

      await expect(service.deleteFeature(mockFeatureId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when deletion fails', async () => {
      mockFeaturesRepository.getFeatureById.mockResolvedValue(mockFeatureId);
      mockFeaturesRepository.deleteFeature.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.deleteFeature(mockFeatureId)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
