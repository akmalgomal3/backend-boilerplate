import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/generate-password')
  generatePassword(@Body() generatePasswordDto: GeneratePasswordDto) {
    const data = this.authService.generatePassword(generatePasswordDto);

    return {
      data,
    };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);

    return {
      data,
    };
  }
}
