import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDTO } from 'src/users/dto/login.dto';
import { BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/services/user.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService

  const mockUsers = {
    id: 'aa57782b-273c-4916-a5fd-205bd6a1d984',
    role_id: 'fa93d2d3-4011-401b-a367-9cbac525cf58',
    username: 'oplabinkur',
    email: 'oplabinkur@gmail.com',
    full_name: 'Operator Labinkur',
    created_by: null,
    active: true,
    created_at: '2024-12-01T07:56:27.333Z',
    updated_at: '2024-10-08T01:29:54.326Z',
    deleted_at: null,
    is_banned: false,
    is_dev: true,
  };

  const mockTokens = {
    accessToken: "mock-access-token", 
    refreshToken: "mock-refresh-token"
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockUsers),
    checkRegisterPassword: jest.fn().mockResolvedValue(mockUsers),
    login: jest.fn().mockResolvedValue(mockTokens),
    validatePassword: jest.fn().mockResolvedValue(mockTokens),
  };

  const mockUserService = {
    getUserByEmailOrUsername: jest.fn().mockResolvedValue(mockUsers)
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ]
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    const registerDTO: CreateUserDto = {
      role_id: "fa93d2d3-4011-401b-a367-9cbac525cf58",
      full_name: "Sahrul Ramdani",
      email: "admin2@ntx.solution.com",
      username: "admin_dua",
      password: "mock-password",
      confirm_password: "mock-password",
      is_dev: true
    }

    it('should return user data', async () => {
      const result = await authController.register(registerDTO)

      expect(authService.register).toHaveBeenCalledWith(registerDTO);
      expect(result).toEqual({
        data: mockUsers
      })
    });

    it('should throw bad request if username exist', async () => {
      jest.spyOn(mockUserService, 'getUserByEmailOrUsername').mockResolvedValue(mockUsers);

      try {
        await authController.register(registerDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  `User with username "${mockUsers.username}" already exists`,
          data: null
        });
      }
    });
    
    it('should throw bad request if email exist', async () => {
      jest.spyOn(mockUserService, 'getUserByEmailOrUsername').mockResolvedValue({username: "valid-username", ...mockUsers});

      try {
        await authController.register(registerDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  `User with email "${mockUsers.email}" already exists`,
          data: null
        });
      }
    });

    it('should throw bad request if password not contain 8-12 characters', async () => {
      jest.spyOn(mockAuthService, 'checkRegisterPassword').mockResolvedValue({isValid: false, message: 'password must contain 8-12 characters'});

      try {
        await authController.register(registerDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  'password must contain 8-12 characters',
          data: null
        });
      }
    });

    it('should throw bad request if password not containnumbers, uppercase and lowercase letters, and special characters', async () => {
      jest.spyOn(mockAuthService, 'checkRegisterPassword').mockResolvedValue({isValid: false, message: 'password must include numbers, uppercase and lowercase letters, and special characters'});

      try {
        await authController.register(registerDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  'password must include numbers, uppercase and lowercase letters, and special characters',
          data: null
        });
      }
    });

    it('should throw bad request if password and confirmation password is not equal', async () => {
      jest.spyOn(mockAuthService, 'checkRegisterPassword').mockResolvedValue({isValid: false, message: 'password and confirmation password is not equal'});

      try {
        await authController.register(registerDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  'password and confirmation password is not equal',
          data: null
        });
      }
    });
  });

  describe('login', () => {
    let req: Request
    let loginDTO: LoginDTO = {
      usernameOrEmail: 'mock-username', 
      password: 'mock-password-encrypt'
    }

    it('should return access & refresh token', async () => {
      const result = await authController.login(req, loginDTO);
      expect(authService.login).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        data: mockTokens
      });
    });

    it('should throw bad request if email or username invalid', async () => {
      jest.spyOn(mockUserService, 'getUserByEmailOrUsername').mockResolvedValue(null);

      try {
        await authController.login(req, loginDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  'email or username not exist',
          data: null
        });
      }
    });

    it('should throw forbidden error if user is banned', async () => {
      jest.spyOn(mockAuthService, 'login').mockResolvedValue({...mockUsers, is_banned: true});

      try {
        await authController.login(req, loginDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.FORBIDDEN, 
          message: `your account is banned by system, contact admin for help`,
          data: null
        });
      }
    });

    it('should throw bad request if password invalid', async () => {
      jest.spyOn(mockAuthService, 'validatePassword').mockResolvedValue(false);

      try {
        await authController.login(req, loginDTO)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response).toEqual({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, 
          message:  `password is incorrect, you had 4 attemp left`,
          data: null
        });
      }
    });
  })

  describe('authorize-token', () => {
    it('should return the user data and status code 200', () => {
      const mockRequest = {
        user: {
          id: 'user-id-123',
          email: 'testuser@example.com',
          full_name: 'Operator Labinkur',
          roles: 'Admin',
        },
      };
  
      const result = authController.profile(mockRequest);
      expect(result).toEqual({
        data: mockRequest.user,
        statusCode: 200,
      });
    });

    it('should throw UnauthorizedException for invalid/expired token', () => {
      const mockRequest = {};
  
      try {
        authController.profile(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual({
          statusCode: HttpStatus.UNAUTHORIZED, 
          message: "token is invalid"
        });
      }
    });

  })
});
