import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { Users } from '../../users/entity/user.entity';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Ip } from '../../common/decorators/ip.decorator';
import { IpInfo, IpType } from '../../common/types/ip.type';
import { LogData } from '../../common/decorators/log.decorator';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';

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
  async generatePassword(
    @Body() body: { password: string; confirmPassword: string },
  ): Promise<object> {
    const { password, confirmPassword } = body;
    return {
      data: this.authService.generateEncryptedPassword(
        password,
        confirmPassword,
      ),
    };
  }
}
