import { BadRequestException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { UserLogActivitiesRepository } from '../repository/user_log_activities.repository';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ActivityMethod, ActivityType } from '../enum/user_log_activities.enum';
import { CreateDescriptionActivity } from '../dto/create_description_activity.dto';
import { UserService } from 'src/users/services/user.service';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { CreateUserLogActivityByUserDTO } from '../dto/create_user_log_activity_by_user.dto';
import { UtilsService } from 'src/libs/utils/services/utils.service';
import { UserActivity } from '../types/user_activitity.type';
import { GetUserActivityDto } from '../dto/get_user_activity_current.dto';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserLogActivitiesService {
  constructor(
    private readonly userActivityRepository: UserLogActivitiesRepository,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
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
      throw new HttpException(
        e.message || 'Error create user log activity',
        e.status || 500,
      );
    }
  }

  async createByUser(
    user: JwtPayload,
    createUserLogActivitiyByUserDTO: CreateUserLogActivityByUserDTO,
  ): Promise<UserActivity>{
    try {
      if (!user || !user?.username) {
        return;
      }

      if (!user?.userId && user?.username) {
        const userData = await this.userService.getUserByUsername(user.username);
        if(!userData?.userId){
          return;
        }

        user.userId = userData.userId;
      }

      let { userId, username, deviceType, ipAddress } = user;
      let { method, url, path, params, statusCode, description } = createUserLogActivitiyByUserDTO;
      let { latitude, longitude } = this.utilsService.getGeoIp(ipAddress);
      let message: string

      const page = this.mappingPageActivity(path);
      const activityType = page.includes('auth')
        ? ActivityType.AUTH
        : ActivityType.ACTIVITY;

      
      if(Array.isArray(description)) message = description.join(', ');
      if (!description) {
        message = this.mappingDescriptionActivity({
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
        description: message,
        device: {
          type: deviceType,
          info: {
            ipAddress,
            latitude,
            longitude,
          },
        },
      };

      if (page.includes("auth") && page.includes('login')) {
        createDto.authDetails = {
          loginTime: new Date(),
        };
      } else if (page.includes("auth") && page.includes('logout')){
        createDto.authDetails = {
          logoutTime: new Date(),
        };

        await this.updateActivityLogoutTimeByUser(userId)
      }

      return await this.create(createDto);
    } catch (e) {
      throw new HttpException(
        e.message || 'Error create user log by user',
        e.status || 500,
      );
    }
  }

  async getUserActivityCurrentUser(userId: string = null, getUserActivityCurrentUserDto: GetUserActivityDto): Promise<PaginatedResponseDto<UserActivity>>{
    try {
      if(!userId){
        throw new BadRequestException('User id is required')
      }

      const {page = 1, limit = 10 } = getUserActivityCurrentUserDto
      const skip = (page - 1) * limit;

      const { activityType, search, startDate, endDate} = getUserActivityCurrentUserDto
      const filter: any = {
        ...(userId && { user_id: userId }),
        ...(search && { description: { $regex: search, $options: 'i' } }),
        ...(activityType && {activity_type: activityType}),
        ...((startDate && endDate) && { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } }),
        is_deleted: false
      };

      const [data, totalItems] = await this.userActivityRepository.getUserActivitiesByCurrentUser(skip, limit, filter);
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        data: this.utilsService.snakeToCamel(data), 
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      }
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user log activity by current user',
        e.status || 500,
      );
    }
  }

  async getUsersLoggedIn(getUserActivityCurrentUserDto: GetUserActivityDto): Promise<PaginatedResponseDto<UserActivity>>{
    try {
      const {page = 1, limit = 10, search, statusCode = "200", startDate, endDate } = getUserActivityCurrentUserDto
      const skip = (page - 1) * limit;

      console.log(startDate, endDate, "ends");
      
      const filter: any = {
        ...(statusCode && { status_code: statusCode }),
        ...(search && { username: { $regex: search, $options: 'i' } }), 
        ...((startDate && endDate) && { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate)} }),
      };

      const [data, totalItems] = await this.userActivityRepository.getUserActivityLoggedInUser(Number(skip), Number(limit), filter);
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: this.utilsService.snakeToCamel(data), 
        metadata: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Number(totalPages),
          totalItems: Number(totalItems),
        },
      }
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user log list user logged in',
        e.status || 500,
      );
    }
  }

  async getUserActivityByDescription(
    userId: string,
    description: string = 'Invalid password'
  ): Promise<{ data: UserActivity[], totalItems: number}> {
    try {
      const filter = {
        ...(userId && { user_id: userId }),
        ...(description && { description }),
        is_deleted: false
      };

      const [data, totalItems] = await this.userActivityRepository.getUserActivityByFilter(filter);
      return { data: this.utilsService.snakeToCamel(data), totalItems };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error get user activity by description',
        e.status || 500,
      );
    }
  }

  async updateActivityLogoutTimeByUser(userId: string){
    try {
      const filter: any = {
        user_id: userId ,
        path: "/auth/login",
        status_code: "200",
        description: { $regex: 'attemped to auth login', $options: 'i' },
        timestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)) 
        },
        is_deleted: false
      };

      const [ getActivityLoggedIn ] : any  = await this.userActivityRepository.getUserActivityByFilter(filter)
      const updatedCount = await this.userActivityRepository.updateUserLogoutTimeByUser(getActivityLoggedIn[0]._id)
      return updatedCount
    } catch (e) {
      throw new HttpException(
        e.message || 'Error update user log activity by description',
        e.status || 500,
      );
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

      const deletedCount = await this.userActivityRepository.softDeleteUserActivityByFilter(filter);
      return { deletedNumber: deletedCount };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error delete user log activity by description',
        e.status || 500,
      );
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
