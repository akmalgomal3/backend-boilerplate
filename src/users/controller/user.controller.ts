import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UserService } from '../services/user.service';
import { GetUnapprovedUserDto } from '../dto/get-unapproved-user.dto';
import { RoleType } from '../../common/enums/user-roles.enum';
import { AuthorizedRoles } from '../../common/decorators/authorized-roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
