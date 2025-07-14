import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Operation Service')
    .setDescription('API documentation for Operation microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ operation-service running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger disponible sur http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
