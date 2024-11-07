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

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map(data => {
                if (data?.statusCode && data?.message) {
                    return {
                        statusCode: data.statusCode,
                        message: data.message,
                        data: data.result || data.data,
                        ...(data.meta ? { meta: data.meta } : {})
                    };
                }

                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const statusCode = response.statusCode || HttpStatus.OK;

                return {
                    statusCode,
                    message: 'Success',
                    data,
                };
            }),
            catchError(err => {
                const ctx = context.switchToHttp();
                const statusCode = err?.status || HttpStatus.INTERNAL_SERVER_ERROR;

                const errorResponse: ApiResponse<null> = {
                    statusCode,
                    message: err.message || 'An unexpected error occurred',
                    data: null,
                };

                return throwError(() => new HttpException(errorResponse, statusCode));
            }),
        );
    }
}