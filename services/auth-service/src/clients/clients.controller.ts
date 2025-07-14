import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateClientUseCase } from '@application/usecases/clients/create-client.usecase';
import { ListClientsUseCase } from '@application/usecases/clients/list-clients.usecase';
import { GetClientByIdUseCase } from '@application/usecases/clients/get-client-by-id.usecase';
import { UpdateClientUseCase } from '@application/usecases/clients/update-client.usecase';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { UserRole } from '@Database/models/enums/userRole.enum';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly listClients: ListClientsUseCase,
    private readonly getClientById: GetClientByIdUseCase,
    private readonly updateClient: UpdateClientUseCase,
  ) {}

  // ENDPOINTS HTTP (avec guards)
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.DIRECTEUR, UserRole.COMPTABLE, UserRole.SUPPORT_CLIENT)
  async list(@Query() query: any) {
    return this.listClients.execute(query);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.DIRECTEUR)
  async create(@Body() body: any) {
    return this.createClient.execute(body);
  }

  // HANDLERS MICROSERVICES POUR API GATEWAY (SANS GUARDS)
  @MessagePattern('clients.list')
  async listMicro(@Payload() query: any) {
    console.log(' [ClientsController] MessagePattern clients.list reçu:', query);
    try {
      const result = await this.listClients.execute(query);
      console.log(' [ClientsController] clients.list réussi:', result);
      return result;
    } catch (error) {
      console.error(' [ClientsController] clients.list erreur:', error);
      throw error;
    }
  }

  @MessagePattern('clients.create')
  async createMicro(@Payload() body: any) {
    return this.createClient.execute(body);
  }

  @MessagePattern('clients.getById')
  async getByIdMicro(@Payload() data: any) {
    return this.getClientById.execute(data.id);
  }

  @MessagePattern('clients.update')
  async updateMicro(@Payload() data: any) {
    return this.updateClient.execute(data);
  }

  @MessagePattern('clients.delete')
  async deleteMicro(@Payload() data: any) {
    // TODO: Implémenter DeleteClientUseCase
    throw new Error('DeleteClientUseCase not implemented yet');
  }
}