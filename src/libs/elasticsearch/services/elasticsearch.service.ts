import { HttpException, Injectable } from '@nestjs/common';
import { ElasticsearchService as ElasticClient } from '@nestjs/elasticsearch';
import {
  IndicesCreateResponse,
  SearchHit,
} from '@elastic/elasticsearch/lib/api/types';
import { CreateLogDto } from '../dto/create-log.dto';
import { GetAppLogDto } from '../dto/get-app-log.dto';

@Injectable()
export class ElasticsearchService {
  constructor(private readonly elasticClient: ElasticClient) {
    this.initIndices().then((): void => console.log('Indices initialized'));
  }

  private logsIndex: string = 'app_logs';

  private async initIndices(): Promise<void> {
    await this.createLogIndex();
  }

  private async createLogIndex(): Promise<IndicesCreateResponse> {
    const exists: boolean = await this.elasticClient.indices.exists({
      index: this.logsIndex,
    });

    if (!exists) {
      return this.elasticClient.indices.create({
        index: this.logsIndex,
        mappings: {
          properties: {
            user_id: { type: 'text' },
            user_role: { type: 'keyword' },
            identifier: { type: 'keyword' },
            method: { type: 'keyword' },
            path: { type: 'text' },
            log_type: { type: 'keyword' },
            status: { type: 'keyword' },
            activity: { type: 'text' },
            timestamp: { type: 'date', format: 'epoch_millis' },
            datetime: { type: 'date' },
            device_type: { type: 'keyword' },
            ip_address: { type: 'ip' },
            user_agent: { type: 'text' },
            location: { type: 'geo_point' },
            country: { type: 'keyword' },
            city: { type: 'keyword' },
            postal_code: { type: 'keyword' },
            timezone: { type: 'keyword' },
          },
        },
      });
    }
  }

  async createLog(logDto: CreateLogDto): Promise<void> {
    try {
      await this.elasticClient.index({
        index: this.logsIndex,
        document: logDto,
      });
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when creating log',
        e.status || 500,
      );
    }
  }

  async getLogs(getLogDto: GetAppLogDto) {
    try {
      const {
        logType,
        status,
        userRole,
        dateTo,
        dateFrom,
        search,
        identifier,
        limit = 10,
        page = 1,
      } = getLogDto;
      const mustQueries = [];
      const shouldQueries = [];

      mustQueries.push({ term: { log_type: logType } });

      if (userRole) {
        mustQueries.push({ term: { user_role: getLogDto.userRole } });
      }

      if (status) {
        mustQueries.push({ term: { status: getLogDto.status } });
      }

      if (identifier) {
        mustQueries.push({ term: { identifier: identifier } });
      }

      if (dateFrom || dateTo) {
        const rangeQuery: any = {
          range: {
            datetime: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          },
        };

        mustQueries.push(rangeQuery);
      }

      if (search) {
        shouldQueries.push({ match: { activity: search } });
      }

      const query = {
        bool: {
          must: mustQueries,
          should: shouldQueries.length > 0 ? shouldQueries : undefined,
        },
      };

      const from: number = (page - 1) * limit;
      const size: number = limit;
      const result = await this.elasticClient.search({
        index: this.logsIndex,
        from,
        size,
        query,
        sort: [
          {
            datetime: {
              order: 'desc',
            },
          },
        ],
      });

      const hits = result.hits.hits.map(
        (hit: SearchHit<unknown>) => hit._source,
      );

      const total: number =
        typeof result.hits.total === 'number'
          ? result.hits.total
          : result.hits.total.value;

      const totalPages: number = Math.ceil(total / limit);

      return {
        hits,
        total,
        totalPages,
        page,
        limit,
      };
    } catch (e) {
      throw new HttpException(
        e.message || 'Error when fetching logs',
        e.status || 500,
      );
    }
  }
}
