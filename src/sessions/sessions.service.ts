import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb'; // MongoDB types
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  private redisClient;

  constructor(
    @Inject('DB_MONGODB') private mongoDb: Db, // Inject custom MongoDB connection
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
    const sessionsCollection = this.mongoDb.collection('sessions'); // Specify the collection name
    const result = await sessionsCollection.insertOne(sessionData);
    return {
      ...sessionData,
      _id: result.insertedId,
    };
  }

  async endSession(userId: number) {
    const sessionsCollection = this.mongoDb.collection('sessions');
    return sessionsCollection.updateMany(
      { userId, logoutTime: null },
      { $set: { logoutTime: new Date() } },
    );
  }

  async getActiveSessions() {
    const sessionsCollection = this.mongoDb.collection('sessions');
    const sessions = await sessionsCollection
      .find({ logoutTime: null })
      .toArray();

    const activeSessions = [];
    for (const session of sessions) {
      const tokenInRedis = await this.redisClient.get(`user:${session.userId}`);
      if (tokenInRedis === session.token) {
        activeSessions.push(session);
      } else {
        await sessionsCollection.updateOne(
          { _id: session._id },
          { $set: { logoutTime: new Date() } },
        );
      }
    }

    return activeSessions;
  }
}
