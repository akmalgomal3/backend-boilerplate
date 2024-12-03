import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { Users } from '../../users/entity/user.entity';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Ip } from '../../common/decorators/ip.decorator';
import { IpType } from '../../common/types/ip.type';
import { LogData } from '../../common/decorators/log.decorator';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '../../common/enums/user.enum';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { User } from '../../common/decorators/user.decorator';

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
}
