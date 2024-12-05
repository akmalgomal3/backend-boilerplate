import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UserActivityInterceptor } from './common/interceptor/user-activities.interceptor';
import { UserActivitiesService } from './user-activities/service/user-activities.service';
import { UserSessionsService } from './user-sessions/service/user-sessions.service';
import apm from 'elastic-apm-node';

async function bootstrap() {
  apm.start({
    serviceName: 'nestjs-apm-example', // Replace with your application name
    serverUrl: 'http://localhost:8200', // APM server URL
    environment: 'development', // Environment name
    // logLevel: 'trace'
  });

  console.log('APM Agent active:', apm.isStarted());

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('APP_PORT') ?? 3000;
    app.enableCors();
    app.enableCors({
      origin: [`http://localhost:${port}`, configService.get<string>('CLIENT_URL')],
      allowedHeaders: ['ip-address', 'x-forwarded-for']
    });

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor(), new UserActivityInterceptor(app.get(UserActivitiesService), app.get(UserSessionsService)));

    const config = new DocumentBuilder()
		.setTitle('Auth Base Prob')
		.setVersion('1.0')
		.addBearerAuth()
    .addGlobalParameters(
      {
      in: 'header',
      required: true,
      name: 'device-id',
      schema: { example: '4d3f4226-864f-4229-9fe5-ea531b363e28'}
      }, 
      {
        in: 'header',
        required: true,
        name: 'x-forwarded-for',
        schema: { example: '103.78.115.174'}
      } 
    )
		.build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    console.log(`App running at http://localhost:${port}`)
    await app.listen(port);
  } catch (error) {
    console.error('Error during application creation:', error);
  }
}
bootstrap();
