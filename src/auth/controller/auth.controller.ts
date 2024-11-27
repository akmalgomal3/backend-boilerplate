import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { Users } from '../../users/entity/user.entity';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const result: Users = await this.authService.register(registerDto);
    return {
      data: {
        id: result.id,
        email: result.email,
        username: result.username,
        role: result.role,
      },
    };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      data,
    };
  }

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
