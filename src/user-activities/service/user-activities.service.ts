import { Injectable, Logger } from '@nestjs/common';
import { UserActivitiesRepository } from '../repository/user-activities.repository';
import { UserActivities } from '../schema/user-activities.schema';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { UserActivityFilterDTO } from '../dto/user-activity-filter.dto';

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

  async getLogs(dto: PaginationDto, filterDTO: UserActivityFilterDTO): Promise<PaginatedResponseDto<UserActivities>> {
    try {
      const { page = 1, limit = 10 } = dto;
      const {action, startDate, endDate} = filterDTO
      const skip = (page - 1) * limit;

      const filter = {
        ...(action && { action: action.toUpperCase() }),
      }

      const [data, totalItems] = await this.userActivityRepository.findAll(skip, limit, filter, startDate, endDate);
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        metadata: {
            page: Number(page),
            limit: Number(limit),
            totalPages: Number(totalPages),
            totalItems: Number(totalItems)
        }
    };
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
