import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateClientUseCase } from '@application/usecases/clients/create-client.usecase';
import { ListClientsUseCase } from '@application/usecases/clients/list-clients.usecase';
import { GetClientByIdUseCase } from '@application/usecases/clients/get-client-by-id.usecase';
import { AuthGuard } from '@infrastructure/guards/auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/guards/roles.decorator';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly listClients: ListClientsUseCase,
    private readonly getClientById: GetClientByIdUseCase,
  ) {}

  // ENDPOINTS HTTP (avec guards)
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'COMMERCIAL', 'TECHNICIEN')
  async list(@Query() query: any) {
    return this.listClients.execute(query);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'COMMERCIAL')
  async create(@Body() body: any) {
    return this.createClient.execute(body);
  }

  // HANDLERS MICROSERVICES POUR API GATEWAY (SANS GUARDS)
  @MessagePattern('clients.list')
  async listMicro(@Payload() query: any) {
    console.log('🔍 [ClientsController] MessagePattern clients.list reçu:', query);
    try {
      const result = await this.listClients.execute(query);
      console.log('✅ [ClientsController] clients.list réussi:', result);
      return result;
    } catch (error) {
      console.error('❌ [ClientsController] clients.list erreur:', error);
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
    // TODO: Implémenter UpdateClientUseCase
    throw new Error('UpdateClientUseCase not implemented yet');
  }

  @MessagePattern('clients.delete')
  async deleteMicro(@Payload() data: any) {
    // TODO: Implémenter DeleteClientUseCase
    throw new Error('DeleteClientUseCase not implemented yet');
  }
} 