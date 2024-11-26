import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConstants {
  private readonly configService: ConfigService;
  public readonly secret: string;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
}
