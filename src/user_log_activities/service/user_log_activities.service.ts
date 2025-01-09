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
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { ErrorMessages } from 'src/common/exceptions/root-error.message';
import { timestamp } from 'rxjs';
import { FilterDto } from 'src/common/dto/filter.dto';
import { SearchDto } from 'src/common/dto/search.dto';
import { SortDto } from 'src/common/dto/sort.dto';

@Injectable()
export class UserLogActivitiesService {
  constructor(
    private readonly userActivityRepository: UserLogActivitiesRepository,
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
      if (!user || !user?.username || !user?.userId) {
        console.error(ErrorMessages.userLogActivities.getMessage('USER_ID_IS_REQUIRED'))
        return;
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
          statusCode
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

  async getUserActivityCurrentUser(userId: string = null, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserActivity>>{
    try {
      if(!userId){
        throw new BadRequestException(
          ErrorMessages.userLogActivities.getMessage('USER_ID_IS_REQUIRED')
        );
      }

      const {page = 1, limit = 10, filters = [], sorts = [], search = [] } = paginationDto
      const skip = (page - 1) * limit;

      let filterBy = this.getFilterQuery(filters, search)
      filterBy = {
        ...filterBy,
        ...(userId && { user_id: userId }),
        is_deleted: false
      }

      let sortBy: any = sorts.length > 0 ? this.getSortQuery(sorts) : { timestamp: -1 }
      
      const [data, totalItems] = await this.userActivityRepository.getUserActivitiesByCurrentUser(skip, limit, filterBy, sortBy);
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

  async getUsersLoggedIn(paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserActivity>>{
    try {
      const {page = 1, limit = 10, filters = [], search = [] } = paginationDto
      const skip = (page - 1) * limit;

      const filterBy = this.getFilterQuery([...filters, { key: "statusCode", value: ['200']}], search)
      const [data, totalItems] = await this.userActivityRepository.getUserActivityLoggedInUser(Number(skip), Number(limit), filterBy);
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

  async deleteUserActivityByUserId(
    userId: string,
  ): Promise<{ deletedNumber: number }> {
    try {
      const filter = {
        ...(userId && { user_id: userId }),
        is_deleted: false
      };

      const deletedCount = await this.userActivityRepository.softDeleteUserActivityByFilter(filter);
      return { deletedNumber: deletedCount };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error delete user log activity by user id',
        e.status || 500,
      );
    }
  }

  getUserLogActivityHeader(){
    return [
      {
        key: 'username',
        label: 'username',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'activityType',
        label: 'Activity Type',
        filterable: true,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'radiobutton',
        option: {
          type: 'url', 
          value: '/options/enum/ActivityType'
        },
        inlineEdit: false,
      },   
      {
        key: 'method',
        label: 'method',
        filterable: true,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'checkbox',
        option: {},
        inlineEdit: false,
      },   
      {
        key: 'path',
        label: 'path',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      }, 
      {
        key: 'statusCode',
        label: 'statusCode',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      }, 
      {
        key: 'description',
        label: 'description',
        filterable: true,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'textarea',
        option: {},
        inlineEdit: false,
      }, 
      {
        key: 'deviceType',
        label: 'deviceType',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'ipAddress',
        label: 'ipAddress',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'text',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'loginTime',
        label: 'loginTime',
        filterable: false,
        sortable: false,
        editable: false,
        searchable: false,
        type: 'date',
        option: {},
        inlineEdit: false,
      },
      {
        key: 'timestamp',
        label: 'createdAt',
        filterable: true,
        sortable: true,
        editable: false,
        searchable: false,
        type: 'date',
        option: {},
        inlineEdit: false,
      },
    ]
  }

  mappingDescriptionActivity(
    createDescriptionActivity: CreateDescriptionActivity,
  ) {
    const { username, method, page, params, statusCode } = createDescriptionActivity;
    const isAuth = page.includes('auth');
    const action = this.mappingMethodActivity(method, statusCode, isAuth);

    let desc = `${username} ${action} ${page}`;

    if (Object.keys(params).length > 0) {
      for (const key in params) {
        desc += ` with ${key} ${params[key]}`;
      }
    }

    return desc;
  }

  mappingMethodActivity(method: string, statusCode: string, isAuth: boolean) {
    let action;
    switch (true) {
      case ActivityMethod.GET == method:
        if(statusCode == "200") action = "viewed"
        break;
      case ActivityMethod.POST == method:
        if(statusCode == "201") action = 'created new'
        if(statusCode == "200") action = "viewed"

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

  getFilterQuery(filters: FilterDto[], search: SearchDto[]): object {
    let filterBy = {}
    filters?.forEach((filter) => {
      const value = filter.value
      const keySnakeCase = this.utilsService.snakeCase(filter.key);

      if(value && typeof value === "string"){
        filterBy[keySnakeCase] = { $regex: value, $options: 'i' }
      }

      if(value && Array.isArray(value)){
        filterBy[keySnakeCase] = { $in: value }
      }

      if(filter.start){
        filterBy[keySnakeCase] = { $gte: filter.start }
      }

      if(filter.end){
        filterBy[keySnakeCase] = {...filterBy[keySnakeCase], $lte: filter.end}
      }
    })

    search?.forEach(toSearch => {
      toSearch?.searchBy?.forEach(column => {
        const keySnakeCase = this.utilsService.snakeCase(column);
        filterBy[keySnakeCase] = { $regex: toSearch.query, $options: 'i' }
      }) 
    })

    return filterBy
  }

  getSortQuery(sorts: SortDto[]): object {
    let sortBy = {}
    sorts?.forEach(sort => {
      const direction = sort.direction.toLocaleLowerCase()
      const keySnakeCase = this.utilsService.snakeCase(sort.key);
      if(direction === 'asc' || direction === 'desc'){
        const numberDirection = direction === 'asc' ? 1 : -1
        sortBy[keySnakeCase] = numberDirection
      }
    })

    return sortBy
  }
}
