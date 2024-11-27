import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../repository/session.repository';
import { CreateSessionDto } from '../dto/create-session.dto';
import { Sessions } from '../entity/session.entity';
import { DeviceType } from '../../../common/enums/user.enum';
import { SessionWithUser } from '../../../common/types/user.type';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<Sessions> {
    try {
      return this.sessionRepository.createSession(createSessionDto);
    } catch (e) {
      throw e;
    }
  }

  async getUserActiveSession(
    userId: string,
    type: DeviceType,
  ): Promise<Sessions> {
    try {
      return this.sessionRepository.getUserActiveSession(userId, type);
    } catch (e) {
      throw e;
    }
  }

  async deleteUnusedSessions(userId: string, type: DeviceType): Promise<void> {
    try {
      return this.sessionRepository.deleteUnusedSessions(userId, type);
    } catch (e) {
      throw e;
    }
  }

  async updateSessionLastActivity(sessionId: string): Promise<void> {
    try {
      return this.sessionRepository.updateSessionLastActivity(sessionId);
    } catch (e) {
      throw e;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      return this.sessionRepository.deleteSession(sessionId);
    } catch (e) {
      throw e;
    }
  }

  async getActiveSessions(): Promise<SessionWithUser[]> {
    try {
      const sessions: SessionWithUser[] =
        await this.sessionRepository.getActiveSessions();

      return sessions.map((session) => ({
        ...session,
      }));
    } catch (e) {
      throw e;
    }
  }
}
