// user-activity.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserActivities } from '../schema/user-activities.schema';

@Injectable()
export class UserActivitiesRepository {
  private readonly logger = new Logger(UserActivities.name);

  constructor(
    @InjectModel('UserActivities') private readonly userActivitiesModel: Model<UserActivities>,
  ) {}

  async create(log: Partial<UserActivities>): Promise<UserActivities | null> {
    try {
      return await this.userActivitiesModel.create(log);
    } catch (error) {
      this.logger.error(`Error creating user activity log: ${error.message}`);
      return null;
    }
  }

  async findAll(): Promise<UserActivities[] | null> {
    try {
      return await this.userActivitiesModel.find().exec();
    } catch (error) {
      this.logger.error(`Error fetching user activity logs: ${error.message}`);
      return null;
    }
  }

  async findById(id: string): Promise<UserActivities | null> {
    try {
      return await this.userActivitiesModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`Error finding user activity by ID: ${error.message}`);
      return null;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.userActivitiesModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.logger.error(`Error deleting user activity by ID: ${error.message}`);
      return false;
    }
  }
}
