import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly userService: UserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const url = req.originalUrl || req.url;

    let userId = 'Guest';
    let username = 'Guest';
    let email = 'Guest';

    if (
      !url.includes('login') &&
      !url.includes('register') &&
      !url.includes('debug')
    ) {
      const user = await this.userService.getUser(req.user?.userId);

      if (user) {
        userId = user[0].user_id;
        username = user[0].username;
        email = user[0].email;
      }
    }

    const now = new Date();
    const log = {
      userId: userId,
      username: username,
      email: email,
      ipAddress: req.headers['x-forwarded-for'],
      deviceType: req.headers['user-agent'],
      method: req.method,
      endpoint: req.originalUrl || req.url,
      timestamp: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    };
    this.elasticsearchService.indexActivityLog(log).catch((error) => {
      console.error('Error indexing activity log:', error);
    });

    return next.handle();
  }
}
