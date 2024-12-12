import { Injectable } from '@nestjs/common';
import { UserLogActivitiesRepository } from '../repository/user_log_activities.repository';
import { UserLogActivities } from '../entity/user_log_activities.entity';
import { CreateUserLogActivityDTO } from '../dto/create_user_log_activity.dto';
import { ActivityMethod } from '../enum/user_log_activities.enum';

@Injectable()
export class UserLogActivitiesService {
    constructor(private readonly userActivityRepository: UserLogActivitiesRepository) {}

    async create(createUserLogActivitiyDTO: CreateUserLogActivityDTO){
        try {
           const result = await this.userActivityRepository.create(createUserLogActivitiyDTO) 
           return result
        } catch (e) {
            throw e
        }
    }

    mappingDescriptionActivity(method: string, path: string){
        const action = this.mappingMethodActivity(method)
        const route = path.split('/')

        return `${action} ${route[route.length - 1]}`
    }

    mappingMethodActivity(method: string){
        let action

        switch(method){
            case ActivityMethod.GET: 
                action = "viewed"
            case ActivityMethod.POST: 
                action = "created new"
            case ActivityMethod.PATCH: 
                action = "updated"
            case ActivityMethod.DELETE: 
                action = "deleted"
            default:
                action = "action unknown"
        }

        return action
    }
    
}
