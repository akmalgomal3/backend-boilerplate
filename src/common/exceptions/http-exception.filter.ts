import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../types/response.type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as any;

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
