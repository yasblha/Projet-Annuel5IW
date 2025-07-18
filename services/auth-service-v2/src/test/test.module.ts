import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestController } from './test.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'auth_queue_v2',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TestController],
})
export class TestModule {}
