import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
// Import de l'initialisation Sequelize commune
import { initDatabase } from '@Database/sequelize';

async function bootstrap() {
  // Initialiser la base de données et charger les modèles Sequelize avant tout
  await initDatabase();

  const app = await NestFactory.create(AppModule, { cors: true });

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Intervention Service')
    .setDescription('API documentation for Intervention microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api');

  // Microservice RabbitMQ to receive commands from other services / gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'intervention_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ intervention-service running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger disponible sur http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}

bootstrap();
