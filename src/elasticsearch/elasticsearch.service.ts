import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticsearchService {
  private readonly client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_URL'),
    });
  }

  async indexActivityLog(log: any) {
    await this.client.index({
      index: 'activity_logs_nest-sso',
      document: log,
    });
  }

  async searchActivityLogs(query: any) {
    const result = await this.client.search({
      index: 'activity_logs_nest-sso',
      body: query,
    });
    return result.hits.hits.map((hit) => hit._source);
  }
}
