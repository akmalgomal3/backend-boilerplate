import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  // Initialize Redis connection
  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Error:', err);
    });
  }

  // Close Redis connection on shutdown
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  // Create a new session (TTL 15 mins)
  async createSession(
    sessionId: string,
    sessionData: any,
    ttlSeconds = 900,
  ): Promise<void> {
    await this.redisClient.set(sessionId, sessionData, 'EX', ttlSeconds); // Set TTL in seconds
  }

  // Get a session by ID
  async getSession(sessionId: string): Promise<string> {
    const sessionString = await this.redisClient.get(sessionId);
    if (!sessionString) {
      return null;
    }
    return sessionString;
  }

  // Update a session by ID
  async updateSession(sessionId: string, updatedData: string): Promise<void> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      throw new Error('Session not found');
    }
    await this.redisClient.set(sessionId, updatedData);
  }

  // Delete a session by ID
  async deleteSession(sessionId: string): Promise<void> {
    await this.redisClient.del(sessionId);
  }

  // Get all session keys (useful for debugging)
  async getAllSessionKeys(pattern = '*'): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  // Validate session by userId and deviceType
  async validateSession(userId: string, deviceType: string): Promise<boolean> {
    const key = `session:${userId}:${deviceType}`;
    const exists = await this.redisClient.exists(key);
    return exists > 0;
  }

  // Update TTL (expire time) of a key
  async updateExpire(key: string, ttlSeconds: number): Promise<boolean> {
    const exists = await this.redisClient.exists(key);
    if (!exists) {
      return false;
    }

    await this.redisClient.expire(key, ttlSeconds);
    return true;
  }
}
