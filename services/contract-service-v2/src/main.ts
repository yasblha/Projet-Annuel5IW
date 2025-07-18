import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

const DEFAULT_RMQ_URL = 'amqp://admin:admin@rabbitmq:5672';
const DEFAULT_RMQ_QUEUE = 'contract_queue_v2';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || DEFAULT_RMQ_URL],
      queue: process.env.RABBITMQ_QUEUE || DEFAULT_RMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
  console.log(`Contract Service V2 is running on: ${await app.getUrl()}`);
  console.log(`RabbitMQ connected to: ${process.env.RABBITMQ_URL || DEFAULT_RMQ_URL}`);
  console.log(`Using queue: ${process.env.RABBITMQ_QUEUE || DEFAULT_RMQ_QUEUE}`);
}

bootstrap();
