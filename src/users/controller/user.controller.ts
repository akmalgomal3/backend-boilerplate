import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "src/common/interceptor/response.interceptor";
import { UserService } from "../services/user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@ApiBearerAuth()
@Controller('/v1/users')
@UseInterceptors(ResponseInterceptor)
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    async getUsers(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('isBanned') isBanned: boolean,
        @Query('isLoggedIn') isLoggedIn: boolean,
        @Query('search') search: string
    ) {
        const result = await this.userService.getUsers({ page, limit }, isBanned, isLoggedIn, search)
        return {
            data: result.data,
            metadata: result.metadata
        };
    }

    @Get('user/:id')
    async getUser(@Param('id', ParseUUIDPipe) id: string) {
        const result = await this.userService.getUser(id)
        return {
            data: result
        }
    }
}