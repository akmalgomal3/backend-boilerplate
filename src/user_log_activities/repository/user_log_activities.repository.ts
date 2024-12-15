import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserLogActivities } from '../entity/user_log_activities.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserLogActivitiesRepository {

  constructor(
    @InjectModel(UserLogActivities.name) private readonly userActivitiesModel: Model<UserLogActivities>
  ) {}

  async create(createUserLogActivitiy: Partial<UserLogActivities>): Promise<UserLogActivities | null> {
    try {
      return await this.userActivitiesModel.create(createUserLogActivitiy);
    } catch (e) {
      throw e
    }
  }

  async getByUserFilter(filter: Partial<UserLogActivities>): Promise<[UserLogActivities[], number]>{
    try {
      const data = await this.userActivitiesModel.find(filter).exec();
      const totalItems = await this.userActivitiesModel.countDocuments(filter).exec()

      return [data, totalItems]
    } catch (e) {
      throw e
    }
  }

  async updateByUserFilter(filter: Partial<UserLogActivities>, updateData: Partial<UserLogActivities>): Promise<number> {
    try {
      const result = await this.userActivitiesModel.updateMany(filter, { $set: updateData}).exec();
      return result.modifiedCount || 0;
    } catch (e) {
      throw e
    }
  }

  async softDeleteByUserFilter(filter: Partial<UserLogActivities>): Promise<number> {
    try {
      const result = await this.userActivitiesModel.updateMany(filter, { $set: {is_deleted: true}}).exec();
      return result.modifiedCount || 0;
    } catch (e) {
      throw e
    }
  }

}
