import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/services/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  private redisClient;

  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    this.redisClient.connect();
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      if (user.is_banned) {
        throw new UnauthorizedException('Your account is already banned');
      }
      const encryptedPassword = user.password;
      const decryptedHashedPassword =
        await this.usersService.decryptPassword(encryptedPassword);
      const passwordMatch = await bcrypt.compare(pass, decryptedHashedPassword);

      if (passwordMatch) {
        if (user.failed_login_attempts > 0) {
          await this.usersService.resetFailedLoginAttempts(user.user_id);
        }
        return user;
      } else {
        await this.usersService.incrementFailedLoginAttempts(user.user_id);
        if (user.failed_login_attempts + 1 >= 5) {
          await this.usersService.banUser(user.user_id);
          throw new UnauthorizedException('Your account is already banned');
        }
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new UnauthorizedException('Invalid credentials');
    }
    return null;
  }

  async login(
    user: any,
    ip: string,
    deviceType: string,
    latitude?: number,
    longitude?: number,
  ): Promise<any> {
    const payload = { sub: user.user_id, role: user.role_id };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    // SSO Implementation
    await this.redisClient.set(`user:${user.user_id}`, token, {
      EX: 900,
    });
    await this.sessionsService.createSession({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      token,
      ipAddress: ip,
      deviceType,
      latitude,
      longitude,
    });

    return {
      access_token: token,
    };
  }

  async logout(userId: number) {
    await this.redisClient.del(`user:${userId}`);
    await this.sessionsService.endSession(userId);
  }
}
