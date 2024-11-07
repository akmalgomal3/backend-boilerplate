import { Test, TestingModule } from "@nestjs/testing"
import { UserService } from "../services/user.service"
import { UserController } from "./user.controller"

describe('UserController', () => {
    let controller: UserController
    let service: UserService

    const mockUsers = [
        {
            user_id: "aa57782b-273c-4916-a5fd-205bd6a1d984",
            username: "oplabinkur",
            password: "241825030f9606a5baff192475e7f97b",
            email: "oplabinkur@gmail.com",
            role_id: "4",
            full_name: "Operator Labinkur",
            active: true,
            created_by: null,
            created_at: null,
            updated_by: "b1cdecdb-fd05-4aff-b6a5-4937bc55d626",
            updated_at: "2024-10-08T01:29:54.326Z",
            is_dev: true
        }
    ];

    const mockPaginatedResponse = {
        data: mockUsers,
        metadata: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalItems: 1
        }
    };

    const mockUserService = {
        getUsers: jest.fn().mockResolvedValue(mockPaginatedResponse),
        getUser: jest.fn().mockResolvedValue(mockUsers[0])
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService
                }
            ]
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return paginated users', async () => {
            const page = 1;
            const limit = 10;

            const result = await controller.getUsers(page, limit);

            expect(service.getUsers).toHaveBeenCalledWith({ page, limit });
            expect(result).toEqual({
                data: mockPaginatedResponse.data,
                metadata: mockPaginatedResponse.metadata
            });
        });

        it('should handle empty result', async () => {
            const emptyResponse = {
                data: [],
                metadata: {
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                    totalItems: 0
                }
            };
            mockUserService.getUsers.mockResolvedValueOnce(emptyResponse);

            const result = await controller.getUsers(1, 10);

            expect(result).toEqual({
                data: [],
                metadata: emptyResponse.metadata
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockUserService.getUsers.mockRejectedValueOnce(error);

            await expect(controller.getUsers(1, 10)).rejects.toThrow('Database error');
        });
    });

    describe('getUser', () => {
        it('should return a single user', async () => {
            const userId = '1';

            const result = await controller.getUser(userId);

            expect(service.getUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUsers[0]);
        });

        it('should handle non-existent user', async () => {
            const userId = 'non-existent';
            mockUserService.getUser.mockResolvedValueOnce(null);

            const result = await controller.getUser(userId);

            expect(result).toBeNull();
        });

        it('should handle service errors', async () => {
            const userId = '1';
            const error = new Error('User not found');
            mockUserService.getUser.mockRejectedValueOnce(error);

            await expect(controller.getUser(userId)).rejects.toThrow('User not found');
        });
    });
})