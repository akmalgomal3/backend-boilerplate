import {
  Body,
  Controller,
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
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApproveUserAuthDto } from '../dto/approve-user-auth.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

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
  async getUser(@Param('userId') userId: string) {
    const result = await this.userService.getUser(userId);
    return result;
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
}
