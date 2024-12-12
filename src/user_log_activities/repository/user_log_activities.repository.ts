import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserLogActivities } from '../entity/user_log_activities.entity';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserLogActivitiesRepository {

  constructor(
    @InjectModel(UserLogActivities.name) private readonly userActivitiesModel: Model<UserLogActivities>
  ) {}

  async create(createUserLogActivitiyDTO: CreateUserLogActivityDTO): Promise<UserLogActivities | null> {
    try {
        return await this.userActivitiesModel.create(createUserLogActivitiyDTO);
    } catch (e) {
        throw e
    }
  }
}
