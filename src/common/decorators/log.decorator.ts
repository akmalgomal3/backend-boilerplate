import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CreateLogDto } from '../../libs/elasticsearch/dto/create-log.dto';

export const LogData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CreateLogDto => {
    const request = ctx.switchToHttp().getRequest();

    return request['log-data'];
  },
);
