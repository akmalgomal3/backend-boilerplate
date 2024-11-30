import { Injectable, Logger } from '@nestjs/common';
import { UserActivitiesRepository } from '../repository/user-activities.repository';
import { UserActivities } from '../schema/user-activities.schema';

@Injectable()
export class UserActivitiesService {
  private readonly logger = new Logger(UserActivitiesService.name);
  constructor(private readonly userActivityRepository: UserActivitiesRepository) {}

  async logActivity(log: Partial<UserActivities>): Promise<UserActivities | null> {
    try {
      return await this.userActivityRepository.create(log);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${error.message}`);
      return null;
    }
  }

  async getLogs(): Promise<UserActivities[] | null> {
    try {
      return await this.userActivityRepository.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch logs: ${error.message}`);
      return null;
    }
  }

  async getLogById(id: string): Promise<UserActivities | null> {
    try {
      return await this.userActivityRepository.findById(id);
    } catch (error) {
      this.logger.error(`Failed to fetch log by ID ${id}: ${error.message}`);
      return null;
    }
  }

  async deleteLog(id: string): Promise<boolean> {
    try {
      return await this.userActivityRepository.deleteById(id);
    } catch (error) {
      this.logger.error(`Failed to delete log by ID ${id}: ${error.message}`);
      return false;
    }
  }
}
