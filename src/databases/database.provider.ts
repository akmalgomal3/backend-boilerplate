import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { DataSource } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DB_POSTGRES',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const dataSource = new DataSource({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [
                    __dirname + '/../**/*.entity{.ts,.js}',
                ],
                logging: ["query", "error"],
                synchronize: false, 
            });

            return dataSource.initialize();
        },
    },
    {
        provide: 'DB_MONGODB',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const client = new MongoClient(configService.get<string>('MONGODB_URL'), {
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });

            await client.connect();
            return client.db(configService.get<string>('MONGODB_DBNAME'));
        },
    },
];