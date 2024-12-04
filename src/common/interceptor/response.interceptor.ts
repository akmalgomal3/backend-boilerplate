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
import * as Sentry from '@sentry/nestjs';

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
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode =
          data?.statusCode || response.statusCode || HttpStatus.OK;

        return {
          success: true,
          statusCode,
          message: data?.message || 'Success',
          data: data?.result || data?.data || null,
          ...(data?.meta ? { meta: data.meta } : {}),
        };
      }),
      catchError((err) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const statusCode = err?.status || HttpStatus.INTERNAL_SERVER_ERROR;

        Sentry.withScope((scope) => {
          scope.setTag('url', request.url);
          scope.setTag('method', request.method);
          scope.setExtras({
            query: request.query,
            params: request.params,
            body: request.body,
          });

          Sentry.captureException(err);
        });
        const errorResponse: ApiResponse<null> = {
          success: false,
          statusCode,
          message: err.message || 'An unexpected error occurred',
          data: null,
        };
        return throwError(() => new HttpException(errorResponse, statusCode));
      }),
    );
  }
}
