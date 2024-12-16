import { Injectable } from '@nestjs/common';
import { UserLogActivitiesRepository } from '../repository/user_log_activities.repository';
import { UserLogActivities } from '../entity/user_log_activities.entity';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ActivityMethod, ActivityType } from '../enum/user_log_activities.enum';
import { CreateDescriptionActivity } from '../dto/create_description_activity.dto';
import { UserService } from 'src/users/services/user.service';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { CreateUserLogActivityByUserDTO } from '../dto/create_user_log_activity_by_user.dto';
import { UtilsService } from 'src/libs/utils/services/utils.service';
import { UserActivity } from '../types/user_activitity.type';

@Injectable()
export class UserLogActivitiesService {
  constructor(
    private readonly userActivityRepository: UserLogActivitiesRepository,
    private readonly userService: UserService,
    private readonly utilsService: UtilsService,
  ) {}

  /** 
    TODO: 
      - Token expired log
  */

  async create(createUserLogActivitiyDTO: CreateUserLogActivityDTO): Promise<UserActivity> {
    try {
      const createModel = this.utilsService.camelToSnake(createUserLogActivitiyDTO);
      const result = await this.userActivityRepository.create(createModel);
      return this.utilsService.snakeToCamel(result);
    } catch (e) {
      throw e;
    }
  }

  async createByUser(
    user: JwtPayload,
    createUserLogActivitiyByUserDTO: CreateUserLogActivityByUserDTO,
  ): Promise<UserActivity>{
    if (!user) {
      return;
    }

    try {
      if (!user?.userId && user?.username) {
        const { userId } = await this.userService.getUserByUsername(
          user.username,
        );
        user.userId = userId;
      }

      let { userId, username, deviceType, ipAddress } = user;
      let { method, url, path, params, statusCode, description } =
        createUserLogActivitiyByUserDTO;
      let { latitude, longitude } = this.utilsService.getGeoIp(ipAddress);

      const page = this.mappingPageActivity(path);
      const activityType = page.includes('auth')
        ? ActivityType.AUTH
        : ActivityType.ACTIVITY;

      if (!description) {
        description = this.mappingDescriptionActivity({
          username,
          method,
          page,
          params,
        });
      }

      let createDto: CreateUserLogActivityDTO = {
        userId,
        username,
        activityType,
        method,
        path: url,
        statusCode,
        description,
        device: {
          type: deviceType,
          info: {
            ipAddress,
            latitude,
            longitude,
          },
        },
      };

      if (page.includes('login')) {
        createDto.authDetails = {
          loginTime: new Date(),
        };
      } else if (page.includes('logout')){
        createDto.authDetails = {
          logoutTime: new Date(),
        };
      }

      return await this.create(createDto);
    } catch (e) {
      throw e;
    }
  }

  async getUserActivityByDescription(
    userId: string,
    description: string = 'Invalid password',
  ): Promise<{ data: UserActivity[], totalItems: number}> {
    try {
      const filter = {
        ...(userId && { user_id: userId }),
        ...(description && { description }),
        is_deleted: false
      };

      const [data, totalItems] = await this.userActivityRepository.getByUserFilter(filter);
      return { data: this.utilsService.snakeToCamel(data), totalItems };
    } catch (e) {
      throw e;
    }
  }

  async UpdateUserByFilter(userId: string, description: string = 'Invalid password'){
    try {
      
    } catch (error) {
      
    }
  }

  async deleteUserActivityByDescription(
    userId: string,
    description: string = 'Invalid password',
  ): Promise<{ deletedNumber: number }> {
    try {
      const filter = {
        ...(userId && { user_id: userId }),
        ...(description && { description }),
        is_deleted: false
      };

      const deletedCount = await this.userActivityRepository.softDeleteByUserFilter(filter);
      return { deletedNumber: deletedCount };
    } catch (e) {
      throw e;
    }
  }

  mappingDescriptionActivity(
    createDescriptionActivity: CreateDescriptionActivity,
  ) {
    const { username, method, page, params } = createDescriptionActivity;
    const isAuth = page.includes('auth');
    const action = this.mappingMethodActivity(method, isAuth);

    let desc = `${username} ${action} ${page}`;

    if (Object.keys(params).length > 0) {
      for (const key in params) {
        desc += ` with ${key} ${params[key]}`;
      }
    }

    return desc;
  }

  mappingMethodActivity(method: string, isAuth: boolean) {
    let action;
    switch (true) {
      case ActivityMethod.GET == method:
        action = 'viewed';
        break;
      case ActivityMethod.POST == method:
        action = 'created new';
        if (isAuth) {
          action = 'attemped to';
        }

        break;
      case ActivityMethod.PATCH == method:
        action = 'updated';
        break;
      case ActivityMethod.DELETE == method:
        action = 'deleted';
        break;
      default:
        action = 'action unknown';
    }

    return action;
  }

  mappingPageActivity(path: string) {
    let pathArray = path.split('/');
    pathArray.shift(); // Remove the first of array cause it always be ''

    pathArray = pathArray.filter((segment) => !segment.includes(':'));

    return pathArray.join(' ').toLocaleLowerCase();
  }
}
