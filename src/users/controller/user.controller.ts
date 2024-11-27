import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Sse,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UserService } from '../services/user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '../../common/enums/user.enum';
import { GetBannedUsersDto } from '../dto/get-banned-users.dto';
import { map } from 'rxjs/operators';
import { LoginUserResponseType } from '../types/login-user-response.type';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(UserRoles.Executive, UserRoles.Admin, UserRoles.Executive)
  @Get('users')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.userService.getUsers({ page, limit });
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Roles(UserRoles.Admin)
  @Get('users/banned')
  async getBannedUsers(@Query() getBannedDto: GetBannedUsersDto) {
    const result = await this.userService.getBannedUsers(getBannedDto);
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Roles(UserRoles.Admin, UserRoles.Executive)
  @Sse('users/logged-in')
  listenToLoggedInUsers(@Req() req: any) {
    const user: JwtPayload = req.user;
    return this.userService
      .subscribeToGetLoggedInUser(user)
      .pipe(map((data: LoginUserResponseType[]) => ({ data })));
  }

  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    const result = await this.userService.getUser(userId);

    return {
      data: result,
    };
  }
}
