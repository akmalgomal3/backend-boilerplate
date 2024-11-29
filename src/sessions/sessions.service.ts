import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb'; // MongoDB types
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  private redisClient;

  constructor(
    @Inject('DB_MONGODB') private mongoDb: Db,
    private configService: ConfigService,
  ) {
    this.redisClient = createClient({
      url: `redis://${this.configService.get<string>(
        'REDIS_HOST',
      )}:${this.configService.get<number>('REDIS_PORT')}`,
    });
    this.redisClient.connect();
  }

  async createSession(sessionData: any) {
    const sessionsCollection = this.mongoDb.collection('sessions');
    const now = new Date();
    sessionData.loginTime =
      sessionData.loginTime || new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const result = await sessionsCollection.insertOne(sessionData);
    return {
      ...sessionData,
      _id: result.insertedId,
    };
  }

  async endSession(userId: number) {
    const sessionsCollection = this.mongoDb.collection('sessions');
    const now = new Date();
    return sessionsCollection.updateMany(
      { userId, logoutTime: null },
      { $set: { logoutTime: new Date(now.getTime() + 7 * 60 * 60 * 1000) } },
    );
  }

  async getActiveSessions() {
    const sessionsCollection = this.mongoDb.collection('sessions');
    const sessions = await sessionsCollection
      .find()
      .sort({ loginTime: -1 })
      .toArray();
    return sessions;
  }
}
