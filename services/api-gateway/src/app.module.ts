import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { ClientsController } from './clients/clients.controller';
import { ContractController } from './contrats/contract.controller';
import { InterventionsController } from './interventions/interventions.controller';
import { AffairesController } from './affaires/affaires.controller';
import { FactureController } from './factures/facture.controller';
import { CompteurController } from './compteurs/compteur.controller';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'CONTRACT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'contract_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'OPERATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'operation_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'INTERVENTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'intervention_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'FACTURE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'facture_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [
    AppController, 
    AuthController, 
    ClientsController, 
    ContractController, 
    InterventionsController, 
    AffairesController, 
    FactureController,
    CompteurController
  ],
  providers: [AppService],
})
export class AppModule {}
