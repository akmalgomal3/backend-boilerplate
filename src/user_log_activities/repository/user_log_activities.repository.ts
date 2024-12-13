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

  async getUserFilter(filter: any): Promise<[UserLogActivities[], number]>{
    try {
      const data = await this.userActivitiesModel.find(filter).exec();
      const totalItems = await this.userActivitiesModel.countDocuments(filter).exec()

      return [data, totalItems]
    } catch (e) {
      throw e
    }
  }

  async updateByDescriptionAndDate(deviceType: string, description: string, date: string, updateData: Partial<UserLogActivities>): Promise<UserLogActivities | null> {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1); // Include the entire day range
  
      return this.userActivitiesModel
        .findOneAndUpdate(
          {
            device: {
              type: deviceType
            } ,
            description,
            timestamp: { $gte: startDate, $lt: endDate }, 
          },
          { $set: updateData },
          { new: true, sort: { timestamp: -1 } },
        )
        .exec();
    } catch (e) {
        throw e
    }
  }
}
