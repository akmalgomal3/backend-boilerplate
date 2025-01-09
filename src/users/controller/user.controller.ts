import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UserService } from '../services/user.service';
import { RoleType } from '../../common/enums/user-roles.enum';
import { AuthorizedRoles } from '../../common/decorators/authorized-roles.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApproveUserAuthDto } from '../dto/approve-user-auth.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { SendUpdateEmailDto } from '../dto/send-update-email.dto';
import { Public } from '../../common/decorators/public.decorator';
import { DeclineUserAuthDto } from '../dto/decline-user-auth.dto';
import { GetUserAuthDto } from '../dto/get-unapproved-user.dto';
import { UpdatePasswordByAdminDto } from '../dto/update-password-by-admin.dto';
import { CreateUserByAdminDto } from '../dto/create-user-by-admin.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

// @ts-ignore
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @Get('/')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.userService.getUsers({ page, limit });
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @ApiBearerAuth()
  @Get('/:userId')
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const result = await this.userService.getUser(userId);
    return { data: result };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/user-auth/all')
  async getUserAuth(@Body() getUserAuth: PaginationDto) {
    const result = await this.userService.getUserAuth(getUserAuth);
    return {
      data: {
        body: result.data,
        sort: getUserAuth.sorts || [],
        filter: getUserAuth.filters || [],
        search: getUserAuth.search || [],
      },
      metadata: result.metadata,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/user-auth/approve')
  async approveUser(
    @User() user: JwtPayload,
    @Body() approveDto: ApproveUserAuthDto,
  ) {
    const result = await this.userService.approveUser(approveDto, user.userId);

    return {
      message: 'User Auth approved successfully',
      data: result,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/user-auth/decline')
  async declineUser(
    @Body() declineDto: DeclineUserAuthDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.declineUserAuth(
      declineDto.userAuthId,
      user.userId,
    );
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'userAuthId',
    required: true,
    description: 'User Auth ID',
  })
  @AuthorizedRoles(RoleType.Admin)
  @Delete('/user-auth/:userAuthId')
  async deleteUserAuth(@Param('userAuthId', ParseUUIDPipe) userAuthId: string) {
    await this.userService.deleteUserAuth(userAuthId);

    return {
      message: 'User Auth deleted successfully',
    };
  }

  @ApiBearerAuth()
  @Patch('/account/password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.updatePassword(
      user.userId,
      updatePasswordDto,
    );
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User ID',
  })
  @AuthorizedRoles(RoleType.Admin)
  @Patch('/admin/password/:userId')
  async updatePasswordByAdmin(
    @User() user: JwtPayload,
    @Body() updatePasswordDto: UpdatePasswordByAdminDto,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const result = await this.userService.updatePasswordByAdmin(
      userId,
      updatePasswordDto,
      user.userId,
    );
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @Patch('/banned/:userId')
  async updateBanUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateBanUserDto: UpdateBanUserDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.updateUserBan(
      userId,
      user?.userId,
      updateBanUserDto?.active,
    );

    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @Patch('/:userId')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.updateUserByUserId(userId, {
      ...updateUserDto,
      updatedBy: user?.userId,
    });

    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Delete('/:userId')
  async deleteUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    await this.userService.hardDeleteUserByUserId(userId);
    return {
      data: null,
    };
  }

  @ApiParam({
    name: 'userId',
    required: true,
    description: 'User ID',
  })
  @ApiBearerAuth()
  @Patch('/:userId/email')
  async sendUpdateEmailVerification(
    @Body() sendUpdateEmailDto: SendUpdateEmailDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.sendUpdateEmail(
      sendUpdateEmailDto.email,
      user,
    );

    return {
      data: result,
    };
  }

  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token',
  })
  @Public()
  @Patch('/email/verify/')
  async verifyUpdateEmail(@Query('token') token: string) {
    const result = await this.userService.updateEmailByToken(token);

    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/user-auth/header/info')
  async getHeaderInfo() {
    const result = await this.userService.getUserAuthHeader();
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/admin')
  async createByAdmin(
    @Body() createUserDto: CreateUserByAdminDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.createUserByAdmin(createUserDto, user.userId);
    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/form/create')
  async getFormCreate() {
    const result = await this.userService.formCreateUserByAdmin();
    return {
      data: result,
    };
  }
}
