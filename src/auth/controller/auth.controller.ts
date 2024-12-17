import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LoginGoogleDto } from '../dto/login-google.dto';

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

  @HttpCode(200)
  @Public()
  @Post('/register-email-verification')
  async registerWithEmailVerification(@Body() registerDto: RegisterDto) {
    const data =
      await this.authService.registerWithEmailVerification(registerDto);

    return {
      data,
    };
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const data = await this.authService.createUserByToken(token);

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

  @Public()
  @HttpCode(200)
  @Post('/login-google')
  async loginGoogle(@Body() loginDto: LoginGoogleDto) {
    const data = await this.authService.loginWithGoogle(
      loginDto.ipAddress,
      loginDto.deviceType,
    );

    return {
      data,
    };
  }

  @Public()
  @Get('/google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const data = await this.authService.handleGoogleLoginCallback(code, state);

    return {
      data,
    };
  }

  @HttpCode(200)
  @ApiBearerAuth()
  @Post('/refresh-token')
  async refreshToken(
    @User() user: JwtPayload,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const data = await this.authService.refreshToken(
      user,
      refreshTokenDto.token,
    );

    return {
      data,
    };
  }

  @HttpCode(200)
  @ApiBearerAuth()
  @Post('/logout')
  async logout(@User() user: JwtPayload) {
    const data = await this.authService.logout(user);

    return {
      data,
    };
  }
}
