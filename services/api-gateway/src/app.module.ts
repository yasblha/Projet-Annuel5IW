import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthV2Controller } from './auth/auth-v2.controller';
//import { ClientsController } from './clients/clients.controller';
import { ClientsV2Controller } from './clients/clients-v2.controller';
import { ContractController } from './contrats/contract.controller';
import { ContractV2Controller } from './contrats/contract-v2.controller';
import { ContractV2DebugController } from './contrats/contract-v2-debug.controller';
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
        name: 'AUTH_SERVICE_V2',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'auth_queue_v2',
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
        name: 'CONTRACT_SERVICE_V2',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@rabbitmq:5672'],
          queue: 'contract_queue_v2',
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
    AuthV2Controller, 
    //ClientsController,
    ClientsV2Controller,
    ContractController,
    ContractV2Controller,
    ContractV2DebugController,
    InterventionsController, 
    AffairesController, 
    FactureController,
    CompteurController
  ],
  providers: [AppService],
})
export class AppModule {}
