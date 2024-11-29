import { Inject, Injectable } from '@nestjs/common';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { Sessions } from '../entity/session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { DeviceType } from '../../../common/enums/user.enum';
import { SessionWithUser } from '../../../common/types/user.type';

@Injectable()
export class SessionRepository {
  private repository: Repository<Sessions>;

  constructor(@Inject('DB_POSTGRES') private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Sessions);
  }

  async createSession(createSessionDto: CreateSessionDto): Promise<Sessions> {
    try {
      const { type, ipAddress, userId, lastActivity, expiresAt, user_agent } =
        createSessionDto;

      const sessions: Sessions[] = await this.repository.query(
        `INSERT INTO sessions (user_id, last_activity, expires_at, device_type, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, lastActivity, expiresAt, type, ipAddress, user_agent],
      );

      return sessions[0];
    } catch (e) {
      throw e;
    }
  }

  async getUserActiveSession(
    userId: string,
    type: DeviceType,
  ): Promise<Sessions> {
    try {
      const sessions: Sessions[] = await this.repository.query(
        `
            SELECT *
            FROM sessions
            WHERE user_id = $1
              AND device_type = $2
              AND expires_at > NOW()
              AND last_activity > NOW() - INTERVAL '15 minutes'
        `,
        [userId, type],
      );

      return sessions[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteUnusedSessions(userId: string, type: DeviceType): Promise<void> {
    try {
      await this.repository.query(
        `
            DELETE
            FROM sessions
            WHERE user_id = $1
              AND device_type = $2
              AND (expires_at <= NOW() OR last_activity <= NOW() - INTERVAL '5 minutes')
        `,
        [userId, type],
      );
    } catch (e) {
      throw e;
    }
  }

  async updateSessionLastActivity(sessionId: string): Promise<void> {
    try {
      await this.repository.query(
        `
            UPDATE sessions
            SET last_activity = NOW()
            WHERE id = $1
        `,
        [sessionId],
      );
    } catch (e) {
      throw e;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.repository.query(
        `
            DELETE
            FROM sessions
            WHERE id = $1
        `,
        [sessionId],
      );
    } catch (e) {
      throw e;
    }
  }

  async getActiveSessions(): Promise<SessionWithUser[]> {
    try {
      const sessions: SessionWithUser[] = await this.repository.find({
        relations: ['user'],
        where: {
          expires_at: MoreThan(new Date()),
          last_activity: MoreThan(new Date(Date.now() - 15 * 60 * 1000)),
        },
      });

      return sessions as SessionWithUser[];
    } catch (e) {
      throw e;
    }
  }
}
