import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../types/response.type';
import { UtilsService } from '../utils/services/utils.service';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly utils: UtilsService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = host.switchToHttp().getRequest();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as any;
    const isPublic: boolean = request['is-public'];

    if (
      !isPublic &&
      request.url !== '/users/logged-in' && // Exclude because is streaming data
      exception.name !== 'SessionTimeoutException'
    ) {
      const logData: CreateLogDto = request['log-data'];
      const logMessage: string =
        typeof errorResponse === 'string'
          ? `User failed to access the route due to ${errorResponse}`
          : `User failed to access the route due to ${errorResponse.message}` ||
            'Internal server error';
      await this.utils.createUserActivityLog({
        ...logData,
        status: 'failed',
        activity: logMessage,
      });
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      statusCode: status,
      data: null,
      message:
        typeof errorResponse === 'string'
          ? errorResponse
          : errorResponse.message || 'Internal server error',
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

export class InvalidPasswordException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
