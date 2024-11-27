import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ElasticClient } from '@nestjs/elasticsearch';
import { IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
import { CreateLogDto } from '../dto/create-log.dto';

@Injectable()
export class ElasticsearchService {
  constructor(private readonly elasticClient: ElasticClient) {
    this.initIndices();
  }

  private logsIndex: string = 'app_logs';

  private async initIndices(): Promise<void> {
    await this.createLogIndex();
    console.log('Indices created');
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
            method: { type: 'keyword' },
            path: { type: 'text' },
            log_type: { type: 'keyword' },
            status: { type: 'keyword' },
            activity: { type: 'text' },
            timestamp: { type: 'date', format: 'epoch_millis' },
            datetime: { type: 'date' },
            device_type: { type: 'keyword' },
            ip_private: { type: 'ip' },
            ip_public: { type: 'ip' },
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
    await this.elasticClient.index({
      index: this.logsIndex,
      document: logDto,
    });
  }
}
