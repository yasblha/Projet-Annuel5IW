import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { CreateClientUseCase } from '@application/usecases/clients/create-client.usecase';
import { ListClientsUseCase } from '@application/usecases/clients/list-clients.usecase';
import { GetClientByIdUseCase } from '@application/usecases/clients/get-client-by-id.usecase';
import { UpdateClientUseCase } from '@application/usecases/clients/update-client.usecase';
import { ClientRepository } from '@Database/repositories/client.repository';
import { AdresseRepository } from '@Database/repositories/adresse.repository';
import { EntrepriseRepository } from '@Database/repositories/entreprise.repository';

@Module({
  providers: [
    CreateClientUseCase,
    ListClientsUseCase,
    GetClientByIdUseCase,
    UpdateClientUseCase,
    ClientRepository,
    AdresseRepository,
    EntrepriseRepository,
  ],
  exports: [CreateClientUseCase, ListClientsUseCase, GetClientByIdUseCase, UpdateClientUseCase],
  controllers: [ClientsController],
})
export class ClientsModule {} 