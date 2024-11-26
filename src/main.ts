import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('APP_PORT') ?? 3000;
  
    app.useGlobalInterceptors(new ResponseInterceptor());

    app.enableCors({
      origin: [`http://localhost:${port}`],
    });

    const config = new DocumentBuilder()
		.setTitle('Auth Base Prob')
		.setVersion('1.0')
		.addBearerAuth()
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
