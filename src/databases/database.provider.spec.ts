import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { MongoClient, Db } from 'mongodb';
import { databaseProviders } from './database.provider';

const mockDataSourceInstance = {
    initialize: jest.fn().mockResolvedValue({
        isInitialized: true,
    })
};

jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => mockDataSourceInstance)
}));

const mockDb = { database: 'test-db' };
const mockMongoClient = {
    connect: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue(mockDb)
};

jest.mock('mongodb', () => ({
    MongoClient: jest.fn().mockImplementation(() => mockMongoClient)
}));

describe('Database Providers', () => {
    let configService: ConfigService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config = {
                                'DB_HOST': 'localhost',
                                'DB_PORT': 5432,
                                'DB_USERNAME': 'test',
                                'DB_PASSWORD': 'test123',
                                'DB_NAME': 'testdb',
                                'MONGODB_URL': 'mongodb://localhost:27017',
                                'MONGODB_DBNAME': 'testmongo'
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();

        configService = moduleRef.get<ConfigService>(ConfigService);
    });

    describe('DB_POSTGRES Provider', () => {
        it('should create postgres connection with correct config', async () => {
            const postgresProvider = databaseProviders.find(
                provider => provider.provide === 'DB_POSTGRES'
            );

            await postgresProvider.useFactory(configService);

            expect(DataSource).toHaveBeenCalledWith({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'test',
                password: 'test123',
                database: 'testdb',
                entities: [expect.stringContaining('/**/*.entity{.ts,.js}')],
                synchronize: false,
            });

            expect(mockDataSourceInstance.initialize).toHaveBeenCalled();
        });

        it('should throw error when postgres connection fails', async () => {
            const mockError = new Error('Connection failed');
            mockDataSourceInstance.initialize.mockRejectedValueOnce(mockError);

            const postgresProvider = databaseProviders.find(
                provider => provider.provide === 'DB_POSTGRES'
            );

            await expect(postgresProvider.useFactory(configService))
                .rejects.toThrow('Connection failed');
        });
    });

    describe('DB_MONGODB Provider', () => {
        it('should create mongodb connection with correct config', async () => {
            const mongoProvider = databaseProviders.find(
                provider => provider.provide === 'DB_MONGODB'
            );

            const result = await mongoProvider.useFactory(configService);

            expect(MongoClient).toHaveBeenCalledWith(
                'mongodb://localhost:27017',
                {
                    connectTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }
            );

            expect(mockMongoClient.connect).toHaveBeenCalled();
            expect(mockMongoClient.db).toHaveBeenCalledWith('testmongo');
            expect(result).toEqual(mockDb);
        });

        it('should throw error when mongodb connection fails', async () => {
            const mockError = new Error('MongoDB connection failed');
            mockMongoClient.connect.mockRejectedValueOnce(mockError);

            const mongoProvider = databaseProviders.find(
                provider => provider.provide === 'DB_MONGODB'
            );

            await expect(mongoProvider.useFactory(configService))
                .rejects.toThrow('MongoDB connection failed');
        });
    });

    describe('Provider Injection', () => {
        it('should inject ConfigService', () => {
            databaseProviders.forEach(provider => {
                expect(provider.inject).toContain(ConfigService);
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});