import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { IpMiddleware } from './common/middlewares/ip.middleware';
import { otelSDK } from './tracing';
// import './opentelemetery';
import * as apm from 'elastic-apm-node';

async function bootstrap() {
  try {
    await otelSDK.start();

    // apm.start({
    //   serviceName: 'nestjs-iqbal',
    //   serverUrl: 'http://10.53.26.159:8200',
    //   environment: 'development',
    //   logLevel: 'trace',
    //   // opentelemetryBridgeEnabled: true,
    // });

    // console.log('APM Agent active:', apm.isStarted());

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port: number = configService.get<number>('APP_PORT') ?? 3000;

    app.useGlobalPipes(new ValidationPipe());
    app.use(new IpMiddleware().use);

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
      .setTitle('#')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.listen(port);
  } catch (error) {
    console.error('Error during application creation:', error);
  }
}

bootstrap();
