import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/common/interceptor/response.interceptor";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
    constructor(private userService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUsers(
        @Query('page') page: number,
        @Query('limit') limit: number
    ) {
        const result = await this.userService.getUsers({ page, limit })
        return {
            data: result.data,
            metadata: result.metadata
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/:id')
    async getUser(@Param('id', ParseUUIDPipe) id: string) {
        const result = await this.userService.getUser(id)
        return {
            data: result
        }
    }
}