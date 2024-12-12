import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { Users } from '../../users/entity/user.entity';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Ip } from '../../common/decorators/ip.decorator';
import { IpType } from '../../common/types/ip.type';
import { LogData } from '../../common/decorators/log.decorator';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '../../common/enums/user.enum';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { User } from '../../common/decorators/user.decorator';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
    @LogData() logData: CreateLogDto,
  ) {
    const result: Users = await this.authService.register(registerDto, logData);
    return {
      data: {
        id: result.id,
        email: result.email,
        username: result.username,
        role: result.role,
      },
    };
  }

  @Public()
  @Post('login/google')
  async loginWithGoogle() {
    const data = await this.authService.loginWithGoogle();

    return {
      data,
    };
  }

  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Google code',
  })
  @Public()
  @Get('/google/callback')
  async getGoogleData(@Query('code') code: string) {
    const data = await this.authService.getClientData(code);

    return {
      data,
    };
  }

  @HttpCode(200)
  @Public()
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @LogData() logData: CreateLogDto,
    @Ip() ipData: IpType,
  ) {
    const data = await this.authService.login(loginDto, logData, ipData);
    return {
      data,
    };
  }

  @Public()
  @Post('/generate-password')
  async generatePassword(@Body() body: GeneratePasswordDto): Promise<object> {
    const { password, confirmPassword } = body;
    return {
      data: this.authService.generateEncryptedPassword(
        password,
        confirmPassword,
      ),
    };
  }

  @ApiBearerAuth()
  @Roles(UserRoles.Operator, UserRoles.Admin, UserRoles.Executive)
  @Post('/logout')
  async logout(@User() user: JwtPayload): Promise<object> {
    const result = await this.authService.logout(user);
    return {
      data: result,
    };
  }

  @Public()
  @Post('/forget-password')
  async forgotPassword(
    @Body() forgetPasswordDto: ForgetPasswordDto,
  ): Promise<object> {
    return {
      data: await this.authService.sendForgetPassword(forgetPasswordDto),
    };
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(
    @Body() resetPassswordDto: ResetPasswordDto,
  ): Promise<object> {
    return {
      data: await this.authService.resetPassword(resetPassswordDto),
    };
  }
}
