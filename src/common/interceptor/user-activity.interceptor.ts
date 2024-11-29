import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const now = new Date();
    if (user) {
      const log = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        method: req.method,
        endpoint: req.originalUrl || req.url,
        timestamp: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      };

      this.elasticsearchService.indexActivityLog(log).catch((error) => {
        console.error('Error indexing activity log:', error);
      });
    }

    return next.handle();
  }
}
