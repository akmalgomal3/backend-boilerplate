import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UserActivityInterceptor } from './common/interceptor/user-activities.interceptor';
import { UserActivitiesService } from './user-activities/service/user-activities.service';

async function bootstrap() {
  try {

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('APP_PORT') ?? 3000;
  
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor(), new UserActivityInterceptor(app.get(UserActivitiesService)));

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
		.setTitle('Auth Base Prob')
		.setVersion('1.0')
		.addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: true,
      name: 'device-id',
      schema: {
        example: '4d3f4226-864f-4229-9fe5-ea531b363e28',
      },
    })
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
