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

    mappingDescriptionActivity(username: string, method: string, page: string){
        const action = this.mappingMethodActivity(method)
        return `${username} ${action} ${page}`
    }

    mappingMethodActivity(method: string){
        let action
        switch(true){
            case ActivityMethod.GET == method: 
                action = "viewed"
                break;
            case ActivityMethod.POST == method: 
                action = "created new"
                break;
            case ActivityMethod.PATCH == method: 
                action = "updated"
                break;
            case ActivityMethod.DELETE == method: 
                action = "deleted"
                break;
            default:
                action = "action unknown"
        }

        return action
    }
    
    mappingPageActivity(path: string){
        let pathArray = path.split('/')
        pathArray.shift() // Remove the first of array cause it always be ''

        pathArray = pathArray.filter(segment => !segment.includes(':'))

        return pathArray.join(" ").toLocaleLowerCase()
    }
}
