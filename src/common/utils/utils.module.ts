import { Global, Module } from '@nestjs/common';
import { UtilsService } from './services/utils.service';
import { ElasticsearchModule } from '../../libs/elasticsearch/elasticsearch.module';

@Global()
@Module({
  imports: [ElasticsearchModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
