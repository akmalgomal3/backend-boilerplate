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

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      generateEncryptedPassword: jest.fn(),
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
    it('should register a user and return the user data', async () => {
      const registerDto: RegisterDto = {
        email: 'iqbal@gmail.com',
        username: 'iqbal123',
        password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
        confirmPassword: 'U2FsdGVkX1+bK5wwBHWqAoDYH3regha856gOXPyWE94=',
        role: UserRoles.Admin,
      };

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
        username: 'iqbal123',
      };

      const result: Users = {
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

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      const response = await controller.register(registerDto, logData);

      expect(response).toEqual({
        data: {
          id: result.id,
          email: result.email,
          username: result.username,
          role: result.role,
        },
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto, logData);
    });
  });

  describe('login', () => {
    it('should login a user and return the user data', async () => {
      const loginDto: LoginDto = {
        password: 'U2FsdGVkX19bKA4OKisXxQ0rp9lKRSkkRckNBKdlkSM=',
        identifier: 'iqbal123',
        deviceType: DeviceType.web,
      };

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
        username: 'iqbal123',
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
