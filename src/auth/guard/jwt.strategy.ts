import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/users/services/user.service';
import { ConfigService } from '@nestjs/config';
import { Users } from 'src/users/entity/user.entity';
import { UserSessionsService } from 'src/user-sessions/service/user-sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
       private usersService: UserService, 
       private configService: ConfigService, 
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
            secretOrKey: configService.get<string>('JWT_SECRET')
        })
    }

    async validate(payload: any): Promise<Partial<Users |null>>{
        const id = payload.sub
        const isExistUser = await this.usersService.getUser(id)
    
        if (!isExistUser){
            throw new HttpException({
                statusCode: HttpStatus.UNAUTHORIZED, 
                message: "token is invalid"
            }, HttpStatus.UNAUTHORIZED)
        }

        isExistUser[0].device_id = payload.deviceId        
        const { password, created_at, updated_at, deleted_at, ...result } = isExistUser[0]

        return result
    }
}