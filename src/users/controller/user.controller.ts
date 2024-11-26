import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UserService } from '../services/user.service';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('users')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.userService.getUsers({ page, limit });
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    const result = await this.userService.getUser(userId);

    return {
      data: result,
    };
  }
}
