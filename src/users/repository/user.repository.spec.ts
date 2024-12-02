import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockRepository: Partial<Repository<Users>>;

  beforeEach(async () => {
    mockRepository = {
      findAndCount: jest.fn(),
      query: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: 'DB_POSTGRES',
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  describe('getUsers', () => {
    it('should return users array and count', async () => {
      const mockUsers = [
        { user_id: '1', username: 'user1' },
        { user_id: '2', username: 'user2' },
      ];
      const mockCount = 2;

      (mockRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUsers,
        mockCount,
      ]);

      const result = await userRepository.getUsers(0, 10);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: {
          username: 'DESC',
        },
      });
      expect(result).toEqual([mockUsers, mockCount]);
    });

    it('should throw error when findAndCount fails', async () => {
      const error = new Error('Database error');
      (mockRepository.findAndCount as jest.Mock).mockRejectedValue(error);

      await expect(userRepository.getUsers(0, 10)).rejects.toThrow(error);
    });
  });

  describe('getUserById', () => {
    it('should return user by id using raw query', async () => {
      const mockUser = { user_id: '1', username: 'user1' };
      (mockRepository.query as jest.Mock).mockResolvedValue([mockUser]);

      const result = await userRepository.getUserById('1');

      expect(mockRepository.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE user_id = $1',
        ['1'],
      );
      expect(result).toEqual([mockUser]);
    });

    it('should throw error when user not found', async () => {
      (mockRepository.query as jest.Mock).mockResolvedValue(null);

      await expect(userRepository.getUserById('1')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      (mockRepository.query as jest.Mock).mockRejectedValue(error);

      await expect(userRepository.getUserById('1')).rejects.toThrow(error);
    });
  });

  describe('createUser', () => {
    it('should create new user successfully', async () => {});
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {});
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {});
  });
});
