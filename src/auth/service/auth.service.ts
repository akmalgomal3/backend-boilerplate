import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from 'src/roles/services/roles.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDTO } from 'src/users/dto/login.dto';
import { Users } from 'src/users/entity/user.entity';
import { UserService } from 'src/users/services/user.service';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly secretKey: string;

  constructor(
    private rolesService: RolesService,
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  async register(registerUserDTO: CreateUserDto): Promise<Users> {
    let { email, username, password, role_id } = registerUserDTO;
    try {
      const role = await this.rolesService.getRoleById(role_id);
      if (!role) {
        throw new NotFoundException(`Role with ID ${role_id} not found`);
      }

      email = email.toLocaleLowerCase();
      username = username.toLocaleLowerCase();
      const existingUser = await this.usersService.getUserByEmailOrUsername(
        email,
        username,
      );
      if (existingUser) {
        if (existingUser.username === username) {
          throw new BadRequestException(
            `User with username "${username}" already exists`,
          );
        } else if (existingUser.email === email) {
          throw new BadRequestException(
            `User with email "${email}" already exists`,
          );
        }
      }

      const bytes = CryptoJS.AES.decrypt(password, this.secretKey);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(decryptedPassword, saltOrRounds);

      const result = await this.usersService.create({
        ...registerUserDTO,
        password: hashedPassword,
      });
      return result;

      //TO DO: Add user activity here
    } catch (e) {
      throw e;
    }
  }

  async login(loginDTO: LoginDTO) {
    let { usernameOrEmail, password } = loginDTO;
    try {
      usernameOrEmail = usernameOrEmail.toLocaleLowerCase();
      const user = await this.usersService.getUserByEmailOrUsername(
        usernameOrEmail,
        usernameOrEmail,
      );

      if (!user) {
        throw new BadRequestException(`email or username not exist`);
      }

      const bytes = CryptoJS.AES.decrypt(password, this.secretKey);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      const isPasswordValid = await bcrypt.compare(decryptedPassword,user.password);
      if (!isPasswordValid) {
        throw new BadRequestException(`password is incorrect`);
      }

      const token = await this.getTokens(user.id, user.username);

      //TO DO: Add user activity here
      return token;
    } catch (e) {
      throw e;
    }
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.jwtSecret,
          expiresIn: '60m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.jwtSecret,
          expiresIn: '1d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async encryptPassword(password: string){
    try {
        const encryptedPassword = CryptoJS.AES.encrypt(password, this.secretKey).toString();
        return encryptedPassword
    } catch (e) {
        throw e
    }
}
}
