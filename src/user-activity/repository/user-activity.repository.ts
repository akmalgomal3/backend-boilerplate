import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LogRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createLog(logDetails: { userId: string; action: string; description: string }): Promise<void> {
    const { userId, action, description } = logDetails;
    try {
      const query = `
        INSERT INTO logs (user_id, action, description, created_at)
        VALUES ($1, $2, $3, NOW());
      `;
      await this.dataSource.query(query, [userId, action, description]);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create log', error.message);
    }
  }
}
