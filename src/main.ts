import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ElasticsearchService } from './elasticsearch/elasticsearch.service';
import { UserActivityInterceptor } from './common/interceptor/user-activity.interceptor';
import * as express from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('APP_PORT') ?? 3000;

    app.useGlobalInterceptors(new ResponseInterceptor());
    const elasticsearchService = app.get(ElasticsearchService);
    app.useGlobalInterceptors(
      new UserActivityInterceptor(elasticsearchService),
    );
    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', 1);
    await app.listen(port);

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
      .setTitle('#')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  } catch (error) {
    console.error('Error during application creation:', error);
  }
}
bootstrap();
