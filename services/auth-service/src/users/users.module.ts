import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MAILER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'mailer_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [UsersService, UserRepository, PasswordService],
  exports: [UsersService, UserRepository, PasswordService],
})
export class UsersModule {}
