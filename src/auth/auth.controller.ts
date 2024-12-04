import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as geoip from 'geoip-lite';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/debug')
  getError() {
    throw new Error('My first Sentry error!');
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Request() req,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    const ip = clientIp === '::1' ? '127.0.0.1' : clientIp;
    const geo = geoip.lookup(ip);

    const agent = req.headers['user-agent'];

    let latitude: number = null;
    let longitude: number = null;

    if (geo) {
      latitude = geo.ll[0];
      longitude = geo.ll[1];
    }
    const result = await this.authService.login(
      user,
      ip,
      agent,
      latitude,
      longitude,
    );
    return {
      data: { accessToken: result.access_token },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId, req.headers['user-agent']);
    return {
      success: true,
      code: 200,
      data: null,
      error: null,
      meta: null,
    };
  }
}
