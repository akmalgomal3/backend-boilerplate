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
import { GetUnapprovedUserDto } from '../dto/get-unapproved-user.dto';
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

// @ts-ignore
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.userService.getUsers({ page, limit });
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Get('/:userId')
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const result = await this.userService.getUser(userId);
    return { data: result };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/approval/all')
  async getUnapprovedUsers(
    @Query() getUnapprovedUserDto: GetUnapprovedUserDto,
  ) {
    const result =
      await this.userService.getUnapprovedUsers(getUnapprovedUserDto);
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Post('/:userAuthId/approve')
  async approveUser(
    @Param('userAuthId', ParseUUIDPipe) userId: string,
    @User() user: JwtPayload,
    @Body() approveDto: ApproveUserAuthDto,
  ) {
    const result = await this.userService.approveUser(
      userId,
      user.userId,
      approveDto.roleId,
    );

    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @Patch('/:userId/password')
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
  @Patch('/banned/:userId')
  async updateBanUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateBanUserDto: UpdateBanUserDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.userService.updateBanUser(
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
    const result = await this.userService.updateUserByUserId({
      ...updateUserDto,
      userId: userId,
      updatedBy: user?.userId,
    });

    return {
      data: result,
    };
  }

  @ApiBearerAuth()
  @Delete('/:userId')
  async deleteUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const result = await this.userService.deleteUserByUserId(userId);

    return {
      data: { effected: result },
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
}
