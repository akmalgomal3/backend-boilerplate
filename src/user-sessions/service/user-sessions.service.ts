import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserSessionsRepository } from './../repository/user-sessions.repository';
import { CreateUserSessionDto } from './../dto/create-user-session.dto';
import { UserSessions } from '../schema/user-sessions.schema';
import { error } from 'console';

@Injectable()
export class UserSessionsService {
  constructor(private readonly userSessionsRepository: UserSessionsRepository) {}

  async createSession(data: CreateUserSessionDto) {
    try {
      return await this.userSessionsRepository.create(data);
    } catch (e) {
      throw e
    }
  }

  async getSessionById(id: string) {
    try {
      return await this.userSessionsRepository.findById(id);
    } catch (e) {
      throw e
    }
  }

  async getSessionsByUserId(user_id: string) {
    try {
      const result = await this.userSessionsRepository.findByUserId(user_id);
      return result
    } catch (e) {
      throw e
    }
  }

  async validateSession(user_id: string, device_type: string): Promise<UserSessions | null> {
    try {
      const existingSession = await this.userSessionsRepository.findByUserIdDeviceType(user_id, device_type);

      const now = new Date();
      if (existingSession[0]){
        if(new Date(existingSession[0].expired_at) <= now || this.isIdle(existingSession[0].last_activity_at)){
          await this.deleteSession(existingSession[0].id)
          return null
        }
      }
      
      
      return existingSession[0]
    } catch (e) {
      throw e
    }
  }

  isIdle(lastActivity: Date): boolean {
    const now = Date.now();
    const lastActivityTimestamp = new Date(lastActivity).getTime()
    const fifteenMinutes = 15 * 60 * 1000;
    return now - lastActivityTimestamp > fifteenMinutes;
  };
  
  async updateLastActivity(user_id: string, deviceType: string): Promise<UserSessions | null>{
    try {
      const sessionUser = await this.validateSession(user_id, deviceType)
      if(!sessionUser){
        throw new UnauthorizedException(`Session not found`)
      }

      const editSession = await this.updateSession(sessionUser.id, {last_activity_at: new Date()})
      return editSession
    } catch (e) {
      throw e
    }
  }

  async updateSession(id: string, updates: Partial<CreateUserSessionDto>) {
    try {
      return await this.userSessionsRepository.update(id, updates);
    } catch (e) {
      throw e
    }
  }

  async deleteSession(id: string) {
    try {
      return await this.userSessionsRepository.delete(id);
    } catch (e) {
      throw e
    }
  }
}
