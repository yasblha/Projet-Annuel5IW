import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { initDatabase } from '@Database/sequelize';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Initialisation de la db postgres
  await initDatabase();
  
  // Création de l'application HTTP
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger
  const config = new DocumentBuilder()
      .setTitle('Service Authentification')
      .setDescription('API pour la gestion des utilisateurs et de l\'authentification')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuration du microservice RabbitMQ
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Démarrage du microservice
  await app.startAllMicroservices();

  // Démarrage du serveur HTTP
  await app.listen(process.env.PORT ?? 3001);
  
  console.log(`✅ Service Auth démarré sur http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`🔌 Microservice RabbitMQ connecté à ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
  console.log(`📚 Swagger dispo sur http://localhost:${process.env.PORT ?? 3001}/api/docs`);
}
bootstrap();
