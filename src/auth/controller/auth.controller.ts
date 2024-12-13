import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/generate-password')
  generatePassword(@Body() generatePasswordDto: GeneratePasswordDto) {
    const data = this.authService.generatePassword(generatePasswordDto);

    return {
      data,
    };
  }

  // directly create a new user
  @Public()
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);

    return {
      data,
    };
  }

  @Public()
  @Post('/register-approval')
  async registerApproval(@Body() registerDto: RegisterDto) {
    const data = await this.authService.registerApproval(registerDto);

    return {
      data,
    };
  }

  @Public()
  @HttpCode(200)
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);

    return {
      data,
    };
  }
}
