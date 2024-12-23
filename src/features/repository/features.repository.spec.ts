import { Test, TestingModule } from '@nestjs/testing';
import { FeaturesRepository } from './features.repository';
import { Features } from '../entity/features.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';

describe('FeaturesRepository', () => {
  describe('Query Methods', () => {
    let featuresRepository: FeaturesRepository;
    const mockRepository = { query: jest.fn() };
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FeaturesRepository,
          {
            provide: 'DB_POSTGRES',
            useValue: mockDataSource,
          },
        ],
      }).compile();

      featuresRepository = module.get<FeaturesRepository>(FeaturesRepository);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(featuresRepository).toBeDefined();
    });

    describe('getFeatures', () => {
      const mockFeatures = [
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
      ];

      it('should return features and total count', async () => {
        const mockCount = [{ count: 2 }];
        mockRepository.query
          .mockResolvedValueOnce(mockFeatures)
          .mockResolvedValueOnce(mockCount);

        const result = await featuresRepository.getFeatures(0, 10);

        expect(mockRepository.query).toHaveBeenNthCalledWith(
          1,
          expect.any(String),
          [0, 10],
        );
        expect(mockRepository.query).toHaveBeenNthCalledWith(
          2,
          expect.any(String),
        );
        expect(result).toEqual([mockFeatures, 2]);
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Query failed'));
        await expect(featuresRepository.getFeatures(0, 10)).rejects.toThrow(
          'Query failed',
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
        mockRepository.query.mockResolvedValue([mockFeature]);
        const result = await featuresRepository.getFeatureById(
          mockFeature.featureId,
        );
        expect(result).toEqual(mockFeature);
      });

      it('should return null if no feature is found', async () => {
        mockRepository.query.mockResolvedValue([]);
        const result =
          await featuresRepository.getFeatureById('non-existent-id');
        expect(result).toBeNull();
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Database Error'));
        await expect(
          featuresRepository.getFeatureById('test-id'),
        ).rejects.toThrow('Database Error');
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
        mockRepository.query.mockResolvedValue([mockFeature]);
        const result = await featuresRepository.getFeatureByName(
          mockFeature.featureName,
        );
        expect(result).toEqual(mockFeature);
      });

      it('should return null if no feature is found', async () => {
        mockRepository.query.mockResolvedValue([]);
        const result =
          await featuresRepository.getFeatureByName('NonExistentFeature');
        expect(result).toBeNull();
      });

      it('should throw an error if query fails', async () => {
        mockRepository.query.mockRejectedValue(new Error('Database Error'));
        await expect(
          featuresRepository.getFeatureByName('test-name'),
        ).rejects.toThrow('Database Error');
      });
    });
  });

  describe('Transaction Methods', () => {
    let featuresRepository: FeaturesRepository;
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

      featuresRepository = new FeaturesRepository(dataSourceMock as DataSource);
      (featuresRepository as any).repository = {
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

    describe('createFeature', () => {
      const createFeatureDto: CreateFeatureDto = {
        featureName: 'FeatureTest5',
        menuId: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
        description: 'Ini feature test 5',
        active: true,
      };
      const userId = 'user-123';

      it('should create a feature and return its ID', async () => {
        const mockFeatureId = [
          { featureId: '0b5010ee-3472-4375-acb6-6941aad29efe' },
        ];
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(mockFeatureId);

        const result = await featuresRepository.createFeature(
          createFeatureDto,
          userId,
        );

        expect(queryRunnerMock.connect).toHaveBeenCalled();
        expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          createFeatureDto.featureName,
          createFeatureDto.menuId,
          createFeatureDto.description,
          createFeatureDto.active,
          userId,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
        expect(result).toEqual(mockFeatureId[0]);
      });

      it('should rollback transaction on failure', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Insert failed'),
        );

        await expect(
          featuresRepository.createFeature(createFeatureDto, userId),
        ).rejects.toThrow('Insert failed');

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });

    describe('updateFeature', () => {
      const updateFeatureDto: UpdateFeatureDto = {
        featureName: 'FeatureTest5',
        menuId: 'ecef5f4a-6a52-4553-8857-ef5f9e51a43b',
        description: 'Ini feature test 5',
        active: true,
      };
      const userId = 'user-123';
      const featureId = '0b5010ee-3472-4375-acb6-6941aad29efe';

      it('should update a feature successfully', async () => {
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(undefined);

        await featuresRepository.updateFeature(
          featureId,
          updateFeatureDto,
          userId,
        );

        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          updateFeatureDto.featureName,
          updateFeatureDto.menuId,
          updateFeatureDto.description,
          updateFeatureDto.active,
          userId,
          featureId,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction if update fails', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Update failed'),
        );

        await expect(
          featuresRepository.updateFeature(featureId, updateFeatureDto, userId),
        ).rejects.toThrow('Update failed');

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });

    describe('deleteFeature', () => {
      const featureId = '98c2703f-ba1a-4b83-a32f-083dddb2a50c';

      it('should delete a feature successfully', async () => {
        (queryRunnerMock.query as jest.Mock).mockResolvedValue(undefined);

        await featuresRepository.deleteFeature(featureId);

        expect(queryRunnerMock.query).toHaveBeenCalledWith(expect.any(String), [
          featureId,
        ]);
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction if delete fails', async () => {
        (queryRunnerMock.query as jest.Mock).mockRejectedValue(
          new Error('Delete failed'),
        );

        await expect(
          featuresRepository.deleteFeature(featureId),
        ).rejects.toThrow('Delete failed');

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
      });
    });
  });
});
