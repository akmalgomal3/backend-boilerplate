import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UserSessionsService } from './../service/user-sessions.service';
import { CreateUserSessionDto } from './../dto/create-user-session.dto';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('/v1/user-sessions')
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Post()
  async create(@Body() createUserSessionDto: CreateUserSessionDto) {
    const result = await this.userSessionsService.createSession(createUserSessionDto);
    return { data: result };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.userSessionsService.getSessionById(id);
    return { data: result };
  }
  
  @Public()
  @Get('user/:user_id')
  async findByUserId(@Param('user_id') user_id: string) {
    const result = await this.userSessionsService.getSessionsByUserId(user_id);
    return { data: result };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<CreateUserSessionDto>,
  ) {
    const result = await this.userSessionsService.updateSession(id, updates);
    return { data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userSessionsService.deleteSession(id);
    return { data: result };
  }
}
