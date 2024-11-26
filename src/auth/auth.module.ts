import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './jwt.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/user.module';
import { JwtStrategy } from './guard/jwt.strategy';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true, 
        secret: configService.get<string>('JWT_SECRET'),  // You can pass the secret key to the JwtModule
        signOptions: { expiresIn: '1h' }
      }),
      inject: [ConfigService],
    }), 
    UsersModule, 
    RolesModule
  ],
  providers: [AuthService, JwtConstants, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
