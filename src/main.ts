import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port: number = configService.get<number>('APP_PORT') ?? 3000;
    const logger = new Logger('NestApplication');

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
      .setTitle('Base Project - User Management')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(port);
    logger.log('Application is running on port ' + port);
  } catch (error) {
    console.error('Error during application creation:', error);
  }
}

bootstrap();
