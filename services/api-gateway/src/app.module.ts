import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { IncidentsProxyController, InterventionsProxyController, IoTProxyController } from './operation.controller';

import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'AGENCY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AGENCY_SERVICE_HOST || 'agency-service',
          port: parseInt(process.env.AGENCY_SERVICE_PORT || '3000'),
        },
      },
      {
        name: 'CONTRACT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CONTRACT_SERVICE_HOST || 'contrat-service',
          port: parseInt(process.env.CONTRACT_SERVICE_PORT || '3000'),
        },
      },
      {
        name: 'INVOICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INVOICE_SERVICE_HOST || 'facture-service',
          port: parseInt(process.env.INVOICE_SERVICE_PORT || '3000'),
        },
      },
      {
        name: 'INTERVENTION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INTERVENTION_SERVICE_HOST || 'operation-service',
          port: parseInt(process.env.INTERVENTION_SERVICE_PORT || '3000'),
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    IncidentsProxyController,
    InterventionsProxyController,
    IoTProxyController,
  ],
  providers: [AppService],
})
export class AppModule { }
