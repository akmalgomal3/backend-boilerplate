import { Test, TestingModule } from "@nestjs/testing";
import { Users } from "../entity/user.entity";
import { UserRepository } from "../repository/user.repository";
import { UserService } from "./user.service"
import { HttpException, HttpStatus } from "@nestjs/common";
import { PaginationDto } from "src/common/dto/pagination.dto";

describe("UserService", () => {
    let userService: UserService;
    let userRepository: Partial<Record<keyof UserRepository, jest.MockedFunction<any>>>;

    const mockUsers: Users[] = [
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
            updated_at: new Date(),
            is_dev: true
        },
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
            updated_at: new Date(),
            is_dev: true
        }
    ]

    beforeEach(async () => {
        const mockUserRepository = {
            getUsers: jest.fn(),
            getUserById: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository
                }
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get(UserRepository);
    });

    describe('getUsers', () => {
        it('should return paginated users successfully', async () => {
            const paginationDto: PaginationDto = {
                page: 1,
                limit: 10
            };
            const totalItems = 2;

            userRepository.getUsers.mockResolvedValue([mockUsers, totalItems]);

            const result = await userService.getUsers(paginationDto);

            expect(result).toEqual({
                data: mockUsers,
                metadata: {
                    page: paginationDto.page,
                    limit: paginationDto.limit,
                    totalPages: 1,
                    totalItems: totalItems
                }
            });
            expect(userRepository.getUsers).toHaveBeenCalledWith(0, paginationDto.limit);
        });

        it('should use default pagination values', async () => {
            const defaultPaginationDto: PaginationDto = {
                page: 1,
                limit: 10
            };
            userRepository.getUsers.mockResolvedValue([mockUsers, 2]);

            const result = await userService.getUsers(defaultPaginationDto);

            expect(result).toEqual({
                data: mockUsers,
                metadata: {
                    page: defaultPaginationDto.page,
                    limit: defaultPaginationDto.limit,
                    totalPages: 1,
                    totalItems: 2
                }
            });
        });

        it('should propagate errors from repository', async () => {
            const paginationDto: PaginationDto = {
                page: 1,
                limit: 10
            };
            const error = new Error('Database error');
            userRepository.getUsers.mockRejectedValue(error);

            await expect(userService.getUsers(paginationDto)).rejects.toThrow(error);
        });

        it('should handle custom pagination values', async () => {
            const customPaginationDto: PaginationDto = {
                page: 2,
                limit: 5
            };
            const totalItems = 8;
            (userRepository.getUsers as jest.MockedFunction<any>).mockResolvedValue([mockUsers, totalItems]);

            const result = await userService.getUsers(customPaginationDto);

            expect(result).toEqual({
                data: mockUsers,
                metadata: {
                    page: 2,
                    limit: 5,
                    totalPages: 2,
                    totalItems: totalItems
                }
            });
            expect(userRepository.getUsers).toHaveBeenCalledWith(5, 5);
        });
    });

    describe('getUser', () => {
        it('should return a user successfully', async () => {
            const userId = '1';
            userRepository.getUserById.mockResolvedValue(mockUsers[0]);

            const result = await userService.getUser(userId);

            expect(result).toEqual(mockUsers[0]);
            expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
        });

        it('should throw HttpException when user is not found', async () => {
            const userId = 'non-existent';
            userRepository.getUserById.mockResolvedValue(null);

            await expect(userService.getUser(userId)).rejects.toThrow(
                new HttpException('User not found', HttpStatus.NOT_FOUND)
            );
        });

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error');
            userRepository.getUserById.mockRejectedValue(error);

            await expect(userService.getUser('1')).rejects.toThrow(error);
        });
    });
})