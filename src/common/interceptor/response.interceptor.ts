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
import { UtilsService } from '../utils/services/utils.service';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly utils: UtilsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const logData: CreateLogDto = request['log-data'];
    return next.handle().pipe(
      map((data) => {
        const ctx: HttpArgumentsHost = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode =
          data?.statusCode || response.statusCode || HttpStatus.OK;

        this.utils
          .createUserActivityLog({
            ...logData,
            status: 'success',
          })
          .then();

        return {
          success: true,
          statusCode,
          message: data?.message || 'Success',
          data: data?.result || data?.data || null,
          ...(data?.metadata ? { metadata: data.metadata } : {}),
        };
      }),
    );
  }
}
