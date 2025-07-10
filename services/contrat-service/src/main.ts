import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
// import { initDatabase } from '@Database/sequelize'; // Décommente si tu as une init DB
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // await initDatabase(); // Décommente si tu as une init DB

  const app = await NestFactory.create(AppModule, { cors: true });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Service Contrat')
    .setDescription('API pour la gestion des contrats')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuration du microservice RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'contract_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Contrat-service démarré sur http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`🔌 Microservice RabbitMQ connecté à ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
  console.log(`📚 Swagger dispo sur http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
