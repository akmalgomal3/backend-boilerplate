import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';

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
}
