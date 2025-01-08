import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { Users } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesService } from '../../roles/service/roles.service';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UtilsService } from '../../libs/utils/services/utils.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserLogActivitiesService } from 'src/user_log_activities/service/user_log_activities.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../libs/email/services/email.service';
import { SessionService } from '../../libs/session/service/session.service';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { UsersAuth } from '../entity/user-auth.entity';
import { UserAuthRequestType } from '../../common/enums/request-type.enum';
import { ApproveUserAuthDto } from '../dto/approve-user-auth.dto';
import { GetUserAuthDto } from '../dto/get-unapproved-user.dto';
import { UpdatePasswordByAdminDto } from '../dto/update-password-by-admin.dto';
import { ConfigService } from '@nestjs/config';
import { ErrorMessages } from '../../common/exceptions/root-error.message';
import { format } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userLogActivitiesService: UserLogActivitiesService,
    private rolesService: RolesService,
    private utilsService: UtilsService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private sessionService: SessionService,
    private configService: ConfigService,
  ) {}

  async getUsers(
    dto: PaginationDto,
  ): Promise<PaginatedResponseDto<Partial<Users>>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;

      const [data, totalItems] = await this.userRepository.getUsers(
        skip,
        limit,
      );
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUser(userId: string): Promise<Users> {
    try {
      const result = await this.userRepository.getUserById(userId);
      if (!result) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_NOT_FOUND'),
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const result = await this.userRepository.getUserByUsername(username);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserAuthByUsername(username: string) {
    try {
      const result = await this.userRepository.getUserAuthByUsername(username);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by username',
        error.status || 500,
      );
    }
  }

  async getUserAuthByEmail(email: string) {
    try {
      const result = await this.userRepository.getUserAuthByEmail(email);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      const result = await this.userRepository.getUserByEmail(email);

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user by email',
        error.status || 500,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      let roleId: string = createUserDto.roleId;

      if (!roleId) {
        roleId = await this.rolesService.getBaseRole();
      }
      return this.userRepository.createUser(
        {
          ...createUserDto,
          roleId,
        },
        true,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating user',
        error.status || 500,
      );
    }
  }

  async createUserAuth(createUserDto: CreateUserDto) {
    try {
      const roleId =
        createUserDto?.roleId || (await this.rolesService.getBaseRole());
      return this.userRepository.createUserAuth(
        { ...createUserDto, roleId },
        true,
      );
    } catch (error) {
      throw new HttpException(
        error.message ?? 'Error creating user',
        error.status ?? 500,
      );
    }
  }

  async declineUserAuth(userId: string, declinerId: string) {
    try {
      const userAuth = await this.getUserAuthById(userId);

      if (!userAuth) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_AUTH_NOT_FOUND'),
        );
      }

      if (userAuth.requestStatus !== UserAuthRequestType.Requested) {
        throw new BadRequestException(
          ErrorMessages.users.getMessage('INVALID_USER_AUTH_MUST_BE_REQUESTED'),
        );
      }

      const declineUser = await this.userRepository.updateUserAuthStatus(
        userId,
        declinerId,
        UserAuthRequestType.Declined,
      );

      return {
        userId: declineUser.userId,
        requestStatus: declineUser.requestStatus,
        updatedBy: declineUser.updatedBy,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error declining user',
        error.status || 500,
      );
    }
  }

  async deleteUserAuth(userId: string): Promise<void> {
    try {
      const userAuth: UsersAuth = await this.getUserAuthById(userId);
      if (!userAuth) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_AUTH_NOT_FOUND'),
        );
      }

      await this.userRepository.deleteUserAuth(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting user',
        error.status || 500,
      );
    }
  }

  async getUnapprovedUsers(getUserAuthDto: GetUserAuthDto) {
    try {
      const {
        page = 1,
        limit: take = 10,
        sortByDate,
        search,
        requestType,
      } = getUserAuthDto;
      const skip: number = (page - 1) * take;
      const [data, total] = await this.userRepository.getUserAuth(
        take,
        skip,
        search,
        sortByDate,
        requestType,
      );

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(take),
          total: Number(total),
          totalPages: Number(Math.ceil(total / take)),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting unapproved users',
        error.status || 500,
      );
    }
  }

  async approveUser(approveDto: ApproveUserAuthDto, approverId: string) {
    try {
      const { userAuthId, roleId } = approveDto;

      const newUser: Users = await this.userRepository.approveUser(
        userAuthId,
        approverId,
        roleId,
      );

      return {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error approving user',
        e.status || 500,
      );
    }
  }

  async banUser(userId: string, bannedBy: string) {
    try {
      return await this.userRepository.updateUserBan(userId, bannedBy);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error banning user',
        e.status || 500,
      );
    }
  }

  async updateUserByUserId(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<Users>> {
    try {
      await this.getUser(updateUserDto.updatedBy);
      const getUserUpdated = await this.getUser(userId);

      if (getUserUpdated.username != updateUserDto.username) {
        await this.validateUsernameEmail(updateUserDto.username);
      }

      if (updateUserDto.roleId) {
        await this.rolesService.getRoleById(updateUserDto.roleId);
      }

      updateUserDto = {
        roleId: updateUserDto.roleId ?? getUserUpdated.role?.roleId,
        username: updateUserDto.username ?? getUserUpdated.username,
        fullName: updateUserDto.fullName ?? getUserUpdated.fullName,
        birthdate:
          updateUserDto.birthdate ??
          format(new Date(getUserUpdated.birthdate), 'yyyy-MM-dd'),
        updatedBy: updateUserDto.updatedBy,
      };

      const updateUser = await this.userRepository.updateUserById(
        userId,
        updateUserDto,
      );

      const userAuth = await this.getUserAuthById(userId);
      if (userAuth) {
        await this.userRepository.updateUserAuthByUserId(
          userAuth.userId,
          updateUserDto,
        );
      }

      return updateUser;
    } catch (e) {
      throw e;
    }
  }

  async updateUserBan(
    userId: string,
    bannedBy: string,
    isActive: boolean,
  ): Promise<Users> {
    try {
      await this.userRepository.updateUserBan(userId, bannedBy, isActive);

      if (isActive) {
        await this.userLogActivitiesService.deleteUserActivityByDescription(
          userId,
        );
      }

      return this.getUser(userId);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error update ban user ',
        e.status || 500,
      );
    }
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_NOT_FOUND'),
        );
      }

      const isMatch = await bcrypt.compare(
        this.utilsService.decrypt(oldPassword),
        user.password,
      );
      if (!isMatch) {
        throw new BadRequestException(
          ErrorMessages.users.getMessage('INVALID_OLD_PASSWORD'),
        );
      }

      const password = this.validatePassword(
        newPassword,
        confirmPassword,
        oldPassword,
      );

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userRepository.updateUserPassword(
        user.userId,
        hashedPassword,
        user.userId,
      );

      return {
        message: `User ${user.username} password updated successfully`,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating password',
        e.status || 500,
      );
    }
  }

  async updatePasswordByAdmin(
    userId: string,
    updatePasswordByAdminDto: UpdatePasswordByAdminDto,
    adminId: string,
  ) {
    try {
      const { newPassword, confirmNewPassword } = updatePasswordByAdminDto;
      const user = await this.getUser(userId);
      if (!user) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_NOT_FOUND'),
        );
      }

      const decryptedPassword = this.utilsService.validateConfirmPassword(
        newPassword,
        confirmNewPassword,
      );

      const hashedPassword = await bcrypt.hash(decryptedPassword, 10);

      await this.userRepository.updateUserPassword(
        user.userId,
        hashedPassword,
        adminId,
      );

      return {
        message: `User ${user.username} password updated successfully`,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating password',
        e.status || 500,
      );
    }
  }

  async setPassword(userId: string, hashedPassword: string) {
    try {
      return this.userRepository.updateUserPassword(
        userId,
        hashedPassword,
        userId,
      );
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating password',
        e.status || 500,
      );
    }
  }

  async sendUpdateEmail(email: string, user: JwtPayload) {
    try {
      const checkUser: Users = await this.getUserByEmail(email);

      if (checkUser) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('EMAIL_ALREADY_USED'),
        );
      }

      const token: string = await this.jwtService.signAsync(
        {
          userId: user.userId,
          email,
        },
        {
          expiresIn: this.configService.get('EXPIRED_EMAIL_TOKEN'),
        },
      );

      const emailTemplate: string = this.emailService.generateSendUpdateEmail(
        user.username,
        token,
      );

      const isTokenExist = await this.sessionService.getSession(
        `update-email:${user.userId}`,
      );

      if (isTokenExist) {
        await this.sessionService.deleteSession(`update-email:${user.userId}`);
      }

      await Promise.all([
        this.emailService.sendEmail({
          to: email,
          subject: 'Update Email',
          html: emailTemplate,
        }),
        this.sessionService.createSession(
          `update-email:${user.userId}`,
          token,
          15 * 60,
        ),
      ]);

      return { message: 'Update email email has been sent' };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error sending update email email',
        e.status || 500,
      );
    }
  }

  async updateEmailByToken(token: string) {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      if (!payload) {
        throw new BadRequestException(
          ErrorMessages.users.getMessage('INVALID_TOKEN'),
        );
      }

      const isTokenExist = await this.sessionService.getSession(
        `update-email:${payload.userId}`,
      );

      if (!isTokenExist) {
        throw new BadRequestException(
          ErrorMessages.users.getMessage('EXPIRED_LINK'),
        );
      }

      const user = await this.getUser(payload.userId);
      if (!user) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_NOT_FOUND'),
        );
      }

      await Promise.all([
        this.updateUserEmail(user.userId, payload.email),
        this.sessionService.deleteSession(`update-email:${user.userId}`),
      ]);

      return {
        message: 'Email updated successfully',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating email by token',
        e.status || 500,
      );
    }
  }

  async updateUserEmail(userId: string, email: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new NotFoundException(
          ErrorMessages.users.getMessage('USER_NOT_FOUND'),
        );
      }

      await this.userRepository.updateUserEmail(userId, email);

      return {
        message: 'Email updated successfully',
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating email',
        e.status || 500,
      );
    }
  }

  async updateUserAuthEmail(userId: string, email: string) {
    try {
      const result = await this.userRepository.updateUserAuthEmail(
        userId,
        email,
      );

      return result;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error updating email',
        e.status || 500,
      );
    }
  }

  async getUserAuthById(userId: string) {
    try {
      const result: UsersAuth =
        await this.userRepository.getUserAuthById(userId);

      return result;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error getting user by id',
        e.status || 500,
      );
    }
  }

  async hardDeleteUserByUserId(userId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      await this.userRepository.hardDeleteUserByUserId(userId, user?.username);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error hard delete user',
        e.status || 500,
      );
    }
  }

  private validatePassword(
    newPassword: string,
    confirmPassword: string,
    oldPassword: string,
  ) {
    const decryptedPassword = this.utilsService.decrypt(newPassword);
    const decryptedConfirmPassword = this.utilsService.decrypt(confirmPassword);
    const decryptedOldPassword = this.utilsService.decrypt(oldPassword);

    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException(
        ErrorMessages.users.getMessage('PASSWORD_NOT_MATCH'),
      );
    }

    if (decryptedPassword === decryptedOldPassword) {
      throw new BadRequestException(
        ErrorMessages.users.getMessage('SAME_OLD_PASSWORD'),
      );
    }

    return decryptedPassword;
  }

  async validateUsernameEmail(
    username: string,
    email: string | null = null,
    isApproval = false,
  ) {
    const [userByUsername, userByEmail] = await Promise.all([
      this.getUserByUsername(username),
      this.getUserByEmail(email),
    ]);

    if (username && userByUsername) {
      throw new BadRequestException(
        ErrorMessages.users.getMessage('USERNAME_ALREADY_USED'),
      );
    }

    if (email && userByEmail) {
      throw new BadRequestException(
        ErrorMessages.users.getMessage('EMAIL_ALREADY_USED'),
      );
    }

    if (isApproval) {
      const userAuthByUsername = await this.getUserAuthByUsername(username);
      const userAuthByEmail = await this.getUserAuthByEmail(email);

      if (userAuthByUsername) {
        throw new BadRequestException(
          `Username already used with status ${userAuthByUsername.requestStatus}, Please use another username or wait for approval or contact admin`,
        );
      }

      if (userAuthByEmail) {
        throw new BadRequestException(
          `Email already used with status ${userAuthByEmail.requestStatus}, Please use another email or wait for approval or contact admin`,
        );
      }
    }
  }
}
