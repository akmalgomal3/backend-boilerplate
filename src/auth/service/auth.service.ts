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
import { CheckPasswordRegist } from '../types/checkPasswordRegister.type.ts';
import { UserSessionsService } from 'src/user-sessions/service/user-sessions.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly secretKey: string;

  constructor(
    private rolesService: RolesService,
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userSessionsService: UserSessionsService
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  async register(registerUserDTO: CreateUserDto): Promise<Users> {
    let { email, username, password, confirm_password, role_id } = registerUserDTO;
    try {
      const role = await this.rolesService.getRoleById(role_id);
      if (!role) {
        throw new NotFoundException(`Role with ID ${role_id} not found`);
      }

      email = email.toLocaleLowerCase();
      username = username.toLocaleLowerCase();

      const existingUser = await this.usersService.getUserByEmailOrUsername(email,username,);
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

      const isPasswordValid = await this.checkRegisterPassword(password, confirm_password)
      if(!isPasswordValid.isValid){
        throw new BadRequestException(isPasswordValid?.message)
      }

      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(isPasswordValid?.decryptedPassword, saltOrRounds);

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

  async login(req: Request, loginDTO: LoginDTO) {
    let { device_id, usernameOrEmail, password } = loginDTO;
    try {
      usernameOrEmail = usernameOrEmail.toLocaleLowerCase();
      const user = await this.usersService.getUserByEmailOrUsername(usernameOrEmail,usernameOrEmail);
      if (!user) {
        throw new BadRequestException(`email or username not exist`);
      }

      if(user.is_banned){
        throw new BadRequestException(`your account is banned  by system, contact admin for help`);
      }

      const isPasswordValid = await this.validatePassword(password, user.password)
      if (!isPasswordValid) {
        let loginAttempUser = user.login_attemp === 0 ? 0 : user.login_attemp - 1
        await this.usersService.updateLoginAttemp(user.id, loginAttempUser)

        if(loginAttempUser === 0){
          await this.usersService.updateBannedUser(user.id, true)
          throw new BadRequestException(`your account is banned by system, contact admin for help`);
        }

        throw new BadRequestException(`password is incorrect, you had ${loginAttempUser} attemp left`);
      }

      const deviceType = await this.usersService.getUserDeviceType(req)

      //TO DO: Validation session user
      const existSession = await this.userSessionsService.validateSession(device_id, user.id, deviceType)
      if(existSession){
        throw new BadRequestException(`session already running in other device`);
      }

      const token = await this.getTokens(user.id, user.username, user.role);

      //TO DO: Create session
      await this.userSessionsService.createSession({
        device_id, 
        user_id: user.id, 
        device_type: deviceType, 
        expired_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in 1 hour
        last_activity_at: new Date(),
      })

      //TO DO: Add user activity here
      return token;
    } catch (e) {
      throw e;
    }
  }

  async getTokens(userId: string, username: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role,
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
          role,
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

  async checkRegisterPassword(password: string, confirm_password: string): Promise<CheckPasswordRegist>{
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    const isValid = true
    try {
      if (!(password && confirm_password)) {
        return { 
          isValid: !isValid, 
          message: 'password and confirm password is required'
        }
      }

      const decryptedPassword = (await this.decryptPassword(password)).toString()
      const decryptedConfirmPassword =(await this.decryptPassword(confirm_password)).toString()

      if (decryptedPassword.length < 8 || decryptedPassword.length > 12) {
        return { isValid: !isValid, message: 'password must contain 8-12 characters'}
      }

      if (!passwordRegex.test(decryptedPassword)) {
        return { isValid: false, message: 'password must include numbers, uppercase and lowercase letters, and special characters'}
      }

      if (!(decryptedPassword === decryptedConfirmPassword)) {
        return { isValid: false, message: 'password and confirmation password is not equal'}
      }

      return {isValid, decryptedPassword}
    } catch (e) {
      throw e
    }
  }

  async validatePassword(password:string, userPassword: string): Promise<Boolean> {
    try {
      const decryptedPassword = await this.decryptPassword(password)
      const isValid = await bcrypt.compare(decryptedPassword, userPassword);
      if(!isValid){
        return isValid
      }

      return isValid;
    } catch (e) {
      throw e
    }
  }

  async decryptPassword(encryptPassword: string): Promise<string|Buffer>{
    try {
      const bytes = CryptoJS.AES.decrypt(encryptPassword, this.secretKey);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);  

      return decryptedPassword
    } catch (e) {
      throw e
    }    
  }

  async encryptPassword(password: string): Promise<String>{
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(password,this.secretKey,).toString();
      
      return encryptedPassword;
    } catch (e) {
      throw e;
    }
  }
}
