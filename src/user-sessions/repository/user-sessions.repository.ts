import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSessions } from './../schema/user-sessions.schema';

@Injectable()
export class UserSessionsRepository {
  constructor(
    @InjectModel(UserSessions.name) private userSessionsModel: Model<UserSessions>,
  ) {}

  async create(data: Partial<UserSessions>): Promise<UserSessions> {
    try {
      const session = new this.userSessionsModel(data);
      return await session.save();
    } catch (e) {
      throw e
    }
  }

  async findById(id: string): Promise<UserSessions | null> {
    try {
      return await this.userSessionsModel.findById(id).exec();
    } catch (e) {
      throw e
    }
  }

  async findByUserId(user_id: string): Promise<UserSessions[]> {
    try {
      const result = await this.userSessionsModel.find({ user_id }).exec();
      return result
    } catch (e) {
      throw e
    }
  }

  async findByFilters(device_id: string, user_id: string, device_type: string): Promise<UserSessions[]> {
    try {
      const result = await this.userSessionsModel.find({
        device_id,
        user_id,
        device_type,
      }).exec();

      return result
    } catch (e) {
      throw e;
    }
  }

  async update(
    id: string,
    updates: Partial<UserSessions>,
  ): Promise<UserSessions | null> {
    try {
      return await this.userSessionsModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    } catch (e) {
      throw e
    }
  }

  async delete(id: string): Promise<UserSessions | null> {
    try {
      return await this.userSessionsModel.findByIdAndDelete(id).exec();
    } catch (e) {
      throw e
    }
  }
}
