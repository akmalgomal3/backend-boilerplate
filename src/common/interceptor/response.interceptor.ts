import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../types/response.type';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx: HttpArgumentsHost = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode =
          data?.statusCode || response.statusCode || HttpStatus.OK;

        return {
          success: true,
          statusCode,
          message: data?.message || 'Success',
          data: data?.result || data?.data || null,
          ...(data?.metadata ? { metadata: data.metadata } : {}),
        };
      }),
      catchError((exception: HttpException) => {
        const status: number = exception.getStatus();
        const errorResponse = exception.getResponse() as any;

        const response: ApiResponse<null> = {
          success: false,
          statusCode: status,
          message:
            typeof errorResponse === 'string'
              ? errorResponse
              : errorResponse.message || 'Internal server error',
          data: null,
        };

        return throwError(() => new HttpException(response, status));
      }),
    );
  }
}
