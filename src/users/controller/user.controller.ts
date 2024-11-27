import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { UserService } from '../services/user.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class UserController {
  constructor(
    private userService: UserService,
    private readonly sessionsService: SessionsService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      success: true,
      code: 201,
      data: user,
      error: null,
      meta: null,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Executive')
  @Get('users')
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.userService.getUsers({ page, limit });
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Executive')
  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    const result = await this.userService.getUser(userId);
    return result;
  }
}
