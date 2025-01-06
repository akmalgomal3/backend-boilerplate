import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserLogActivities } from '../entity/user_log_activities.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityType } from '../enum/user_log_activities.enum';
import { timestamp } from 'rxjs';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserLogActivitiesRepository {

  constructor(
    @InjectModel(UserLogActivities.name) private readonly userActivitiesModel: Model<UserLogActivities>
  ) {}

  async create(createUserLogActivitiy: Partial<UserLogActivities>): Promise<UserLogActivities | null> {
    try {
      return await this.userActivitiesModel.create(createUserLogActivitiy);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error create user log activities',
        e.status || 500,
      );
    }
  }

  async getUserActivitiesByCurrentUser(skip: number, take: number, filter: Partial<UserLogActivities>): Promise<[UserLogActivities[], number]>{
    try {
      const data = await this.userActivitiesModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(take).exec();
      const totalItems = await this.userActivitiesModel.countDocuments(filter).exec()

      return [data, totalItems]
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user log activities by current user',
        e.status || 500,
      );
    }
  }

  async getUserActivityByFilter(filter: Partial<UserLogActivities>): Promise<[UserLogActivities[], number]>{
    try {
      const data = await this.userActivitiesModel.find(filter).sort({timestamp: -1}).exec();
      const totalItems = await this.userActivitiesModel.countDocuments(filter).exec()

      return [data, totalItems]
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user log activities by filter',
        e.status || 500,
      );
    }
  }

  async getUserActivityLoggedInUser(skip: number, take: number, filter: Partial<UserLogActivities>): Promise<[String[], number]>{
    try {
      const aggregationPipeline = [
        {
          $match: { ...filter, path: "/auth/login", "auth_details.logout_time": { $exists: false } }
        },
        {
          $sort: { timestamp: -1 as -1 }
        },
        {
          $project: {
            user_id: 1,
            username: 1,
            date: {$dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, 
            activity_type: 1, 
            method: 1, 
            path: 1, 
            status_code: 1, 
            description: 1, 
            device: 1, 
            auth_details: 1, 
            timestamp: 1
          }
        },
        {
          $group: {
            _id: {
              user_id: "$user_id", 
              date: "$date"
            }, 
            id: { $first: "$_id"},
            user_id: { $first: "$user_id" },
            username: { $first: "$username" },
            activity_type: { $first: "$activity_type" },
            method: { $first: "$method" },
            path: { $first: "$path" },
            status_code: { $first: "$status_code" },
            description: { $first: "$description" },
            device: { $first: "$device" },
            auth_details: { $first: "$auth_details" },
            timestamp: { $first: "$timestamp" },
          }
        },
        {
          $project: {
            _id: "$id", 
            user_id: 1, 
            username: 1,
            activity_type: 1, 
            method: 1, 
            path: 1, 
            status_code: 1, 
            description: 1, 
            device: 1, 
            auth_details: 1, 
            timestamp: 1
          }
        },
      ];

      const countPipeline = [
        { $match: { ...filter, path: "/auth/login",  "auth_details.logout_time": { $exists: false } }},
        {
          $project: {
            user_id: 1,
            date: {$dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, 
            timestamp: 1
          }
        },
        {
          $group: {
            _id: {
              user_id: "$user_id", 
              date: "$date"
            } 
          }
        },
        { $count: "total" },
        {
          $project: {
            total: 1
          }
        }
      ];

      const data = await this.userActivitiesModel.aggregate(aggregationPipeline).skip(skip).limit(take).exec();
      const countResult = await this.userActivitiesModel.aggregate(countPipeline).exec();
      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      return [data, totalItems]
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user log activities logged in user',
        e.status || 500,
      );
    }
  }

  async updateUserLogoutTimeByUser(id: ObjectId): Promise<number> {
    try {
      const result = await this.userActivitiesModel.updateOne({_id: id}, {$set: {"auth_details.logout_time": new Date()}}).exec();
      return result.modifiedCount || 0;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error update user log activities logout time by user',
        e.status || 500,
      );
    }
  }

  async softDeleteUserActivityByFilter(filter: Partial<UserLogActivities>): Promise<number> {
    try {
      const result = await this.userActivitiesModel.updateMany(filter, { $set: {is_deleted: true}}).exec();
      return result.modifiedCount || 0;
    } catch (e) {
      throw new HttpException(
        e.message || 'Error soft delete user log activities by filter',
        e.status || 500,
      );
    }
  }

}
