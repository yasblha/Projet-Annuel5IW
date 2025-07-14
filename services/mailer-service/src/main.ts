import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
// Remplacer l'import par require pour éviter les problèmes de typage
const express = require('express');

async function bootstrap() {
  // Serveur HTTP pour les probes K8s
  try {
    const healthApp = express();
    healthApp.get('/health', (_req: any, res: any) => {
      console.log('Health check requested');
      res.status(200).send('OK');
    });
    
    healthApp.listen(3005, '0.0.0.0', () => {
      console.log('HTTP health endpoint listening on 0.0.0.0:3005');
    });
  } catch (error) {
    console.error('Error starting health server:', error);
  }

  // Microservice RabbitMQ
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
        queue: 'mailer_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
  console.log('Mailer microservice is listening');
}

bootstrap();
