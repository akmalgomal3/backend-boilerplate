import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { UpdateUserDto } from '../dto/update-user.dto';

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
      data: user,
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
    return {
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(userId, updateUserDto);
    return {
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Operator')
  @Get('banned')
  async getBannedUsers() {
    const users = await this.userService.findBannedUsers();
    return {
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('logged-in')
  async getLoggedInUsers() {
    const sessions = await this.sessionsService.getActiveSessions();
    const data = sessions;
    return {
      data: data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('activity')
  async getUserActivity(@Query('userId') userId: string) {
    const query = userId
      ? {
          query: {
            match: { userId: parseInt(userId, 10) },
          },
          sort: [
            {
              timestamp: { order: 'desc' },
            },
          ],
        }
      : {
          query: {
            match_all: {},
          },
          sort: [
            {
              timestamp: { order: 'desc' },
            },
          ],
        };

    const activities =
      await this.elasticsearchService.searchActivityLogs(query);
    return {
      data: activities,
    };
  }
}
