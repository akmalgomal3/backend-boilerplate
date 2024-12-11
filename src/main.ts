import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port: number = configService.get<number>('APP_PORT') ?? 3000;

    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.listen(port);

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
      .setTitle('Base Project - User Management')
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
