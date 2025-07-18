import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors();
  
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Service V2 API')
    .setDescription('Authentication and User Management API')
    .setVersion('2.0')
    .addTag('auth')
    .addTag('users')
    .addTag('roles')
    .addTag('clients')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Connect to RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'auth_queue_v2',
      queueOptions: {
        durable: true,
        persistent: true,
      },
      noAck: false,
    },
  });
  
  await app.startAllMicroservices();
  
  const port = process.env.AUTH_SERVICE_PORT || 3001;

  await app.listen(process.env.AUTH_SERVICE_PORT || 3001, '0.0.0.0');  console.log(`Auth Service V2 is running on port: ${port}`);

  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}

bootstrap();
