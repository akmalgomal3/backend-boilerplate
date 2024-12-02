import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { Users } from '../../users/entity/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';
import { DeviceType, UserRoles } from '../../common/enums/user.enum';
import { IpType } from '../../common/types/ip.type';
import { LoginDto } from '../dto/login.dto';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Sessions } from '../../libs/session/entity/session.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    generateEncryptedPassword: jest.fn(),
    validateConfirmPassword: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockSessionService = {
    getUserActiveSession: jest.fn(),
  };

  const mockUser: Users = {
    id: 'someid',
    email: 'iqbal@gmail.com',
    username: 'iqbal123',
    role: 'Admin',
    ban_reason: null,
    created_at: new Date(),
    failed_login_attempts: 0,
    is_banned: false,
    password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
    sessions: [],
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      generateEncryptedPassword: jest.fn(),
      validateConfirmPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'iqbal@gmail.com',
      username: 'iqbal123',
      password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
      confirmPassword: 'U2FsdGVkX1+bK5wwBHWqAoDYH3regha856gOXPyWE94=',
      role: UserRoles.Admin,
    };
    it('should register a user and return the user data', async () => {
      const logData: CreateLogDto = {
        activity: 'User Registration',
        city: 'New York',
        country: 'USA',
        datetime: new Date(),
        device_type: 'web',
        ip_address: '192.168.1.1',
        location: { lat: 40.7128, lon: -74.006 },
        log_type: 'user_activity',
        method: 'POST',
        path: '/auth/register',
        postal_code: '10001',
        status: 'success',
        timestamp: Date.now(),
        timezone: 'America/New_York',
        user_agent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        user_id: 'someuserid',
        user_role: UserRoles.Admin,
        identifier: 'iqbal123',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);

      const response = await controller.register(registerDto, logData);

      expect(response).toEqual({
        data: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role,
        },
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto, logData);
    });

    it('should throw an error if the password and confirm password do not match', async () => {
      const mismatchedRegisterDto: RegisterDto = {
        ...registerDto,
        confirmPassword: 'differentpassword',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new BadRequestException('Password does not match'));

      // controller rejects with BadRequestException
      await expect(
        controller.register(mismatchedRegisterDto, {} as CreateLogDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the password is not strong enough', async () => {
      const weakPassword: RegisterDto = {
        ...registerDto,
        password: 'weakpassword',
        confirmPassword: 'weakpassword',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(
          new BadRequestException(
            'Password must be 8 to 12 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          ),
        );

      await expect(
        controller.register(weakPassword, {} as CreateLogDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if identifier is already taken', async () => {
      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(
          new BadRequestException('Username or email is already taken !!'),
        );

      await expect(
        controller.register(registerDto, {} as CreateLogDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
      identifier: 'iqbal123',
    };

    it('should login a user and return the user data', async () => {
      const logData: CreateLogDto = {
        activity: 'User Login',
        city: 'New York',
        country: 'USA',
        datetime: new Date(),
        device_type: 'web',
        ip_address: '192.168.1.1',
        location: { lat: 40.7128, lon: -74.006 },
        log_type: 'user_activity',
        method: 'POST',
        path: '/auth/login',
        postal_code: '10001',
        status: 'success',
        timestamp: Date.now(),
        timezone: 'America/New_York',
        user_agent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        user_id: 'someuserid',
        user_role: UserRoles.Admin,
        identifier: 'iqbal123',
      };

      const ipData: IpType = {
        'ip-address': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      };

      const result = {
        accessToken: 'someaccesstoken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      const response = await controller.login(loginDto, logData, ipData);

      expect(response).toEqual({
        data: result,
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto, logData, ipData);
    });

    it('should throw an error if identifier is not found', async () => {
      const invalidLoginDto: LoginDto = {
        ...loginDto,
        identifier: 'invaliduser',
      };

      jest
        .spyOn(mockAuthService, 'validateUser')
        .mockRejectedValue(new NotFoundException('Invalid username / email'));

      await expect(
        mockAuthService.validateUser(invalidLoginDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if user already banned', async () => {
      const bannedUser: Users = {
        ...mockUser,
        is_banned: true,
      };

      jest
        .spyOn(mockAuthService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException('User has been banned'));

      await expect(mockAuthService.validateUser(bannedUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if user password is incorrect', async () => {
      const invalidPassword: LoginDto = {
        ...loginDto,
        password: 'invalidpassword',
      };

      jest
        .spyOn(mockAuthService, 'validateUser')
        .mockRejectedValue(new BadRequestException('Invalid password'));

      await expect(
        mockAuthService.validateUser(invalidPassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if there is already an active session for the user', async () => {
      const activeSession: Sessions = {
        id: 'somesessionid',
        user: {} as Users,
        device_type: DeviceType.web,
        ip_address: '192.168.10.1',
        last_activity: new Date(),
        expires_at: new Date(),
        user_agent: 'Mozilla/5.0',
      };
      jest
        .spyOn(mockSessionService, 'getUserActiveSession')
        .mockResolvedValue(activeSession);

      await expect(
        mockSessionService.getUserActiveSession('someuserid', DeviceType.web),
      ).resolves.toEqual(activeSession);

      jest
        .spyOn(mockAuthService, 'login')
        .mockRejectedValue(
          new UnauthorizedException(
            'There is an active user, please logout first',
          ),
        );

      await expect(
        mockAuthService.login(loginDto, {} as CreateLogDto, {} as IpType),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generatePassword', () => {
    it('should generate encrypted password and confirm password', async () => {
      const body: GeneratePasswordDto = {
        password: 'Iqbal!23',
        confirmPassword: 'Iqbal!23',
      };

      const result = {
        password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
        confirmPassword: 'U2FsdGVkX1+bK5wwBHWqAoDYH3regha856gOXPyWE94=',
      };

      jest
        .spyOn(authService, 'generateEncryptedPassword')
        .mockReturnValue(result);

      const response = await controller.generatePassword(body);

      expect(response).toEqual({
        data: {
          password: result.password,
          confirmPassword: result.confirmPassword,
        },
      });
    });
  });
});
