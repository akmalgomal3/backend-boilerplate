import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../types/response.type';
import { UserLogActivitiesService } from 'src/user_log_activities/service/user_log_activities.service';
import { CreateUserLogActivityByUserDTO } from 'src/user_log_activities/dto/create_user_log_activity_by_user.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserService } from 'src/users/services/user.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private userLogActivitiesService: UserLogActivitiesService,
    private userServices: UserService
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>() as any;
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as any;
    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : errorResponse.message || 'Internal server error';

    let user: JwtPayload = request?.user;
    const url = request.url;

    if (url.includes('login')) {
      const findUser = await this.userServices.getUserByUsername(request?.body?.username);
      if(findUser?.userId){
        user = request?.body;
        user.userId = findUser?.userId;
      }
    }

    if (user && user.userId) {
      const userLogActivity: CreateUserLogActivityByUserDTO = {
        method: request.method,
        url: request.url,
        path: request?.route?.path,
        statusCode: status.toString(),
        description: message,
        params: request?.params,
      };

      await this.userLogActivitiesService.createByUser(user, userLogActivity);
    }

    console.error('HTTP Exception:', {
      status,
      message,
      method: request.method,
      url: request.url,
      params: request.params,
      body: request.body,
      stack: exception.stack,
    });

    const apiResponse: ApiResponse<null> = {
      success: false,
      statusCode: status,
      data: null,
      message,
      meta: null,
    };

    response.status(status).json(apiResponse);
  }
}

export class SessionTimeoutException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
