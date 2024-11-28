import { Body, Controller, Get, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from '../service/auth.service';
import { UserService } from 'src/users/services/user.service';
import { EncryptPasswordDTO } from '../../users/dto/encrypt.dto';
import { LoginDTO } from 'src/users/dto/login.dto';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/guard/roles.guard';
import { RoleEnum } from 'src/roles/entity/roles.enum';
import { Roles } from 'src/roles/guard/roles.decorator';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('/v1/auth')
export class AuthController {
    constructor(
        private authService: AuthService,

    ){}

    @Public()
    @Post('register')
    async register(@Body() registerDTO: CreateUserDto){
        const result = await this.authService.register(registerDTO)
        return {
            data: result
        }
    }

    @Public()
    @Post('login')
    async login(@Request() req, @Body() loginDTO: LoginDTO){
        const result = await this.authService.login(req, loginDTO)
        return {
            statusCode: HttpStatus.OK,
            data: result
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('/authorize-token')
    @Roles(RoleEnum.Admin)
    profile(@Request() req: any){
        return {
            data: req.user
        }
    }

    @Public()
    @Post('password/encrypt')
    async encrypt(@Body() encryptPasswordDTO: EncryptPasswordDTO){
        const { password } = encryptPasswordDTO
        const result = await this.authService.encryptPassword(password)
        
        return {
            statusCode: HttpStatus.OK,
            data: result
        }
    } 
}
