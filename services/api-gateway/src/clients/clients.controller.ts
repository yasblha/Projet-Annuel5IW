import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ListClientsDto } from '../application/dtos/clients/list-clients.dto';
import { CreateClientDto } from '../application/dtos/clients/create-client.dto';

@Controller('clients')
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Get()
  async listClients(@Query() query: ListClientsDto) {
    this.logger.log(`🔍 [ClientsController] GET /clients - Paramètres: ${JSON.stringify(query)}`);
    return this.handleRequest('clients.list', query);
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    this.logger.log(`🔍 [ClientsController] GET /clients/${id}`);
    return this.handleRequest('clients.getById', { id });
  }

  @Post()
  async createClient(@Body() createClientDto: CreateClientDto) {
    this.logger.log(`➕ [ClientsController] POST /clients - Création: ${createClientDto.nom} ${createClientDto.prenom}`);
    return this.handleRequest('clients.create', createClientDto);
  }

  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() updateClientDto: any) {
    this.logger.log(`✏️ [ClientsController] PUT /clients/${id}`);
    return this.handleRequest('clients.update', { id, ...updateClientDto });
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    this.logger.log(`🗑️ [ClientsController] DELETE /clients/${id}`);
    return this.handleRequest('clients.delete', { id });
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      return await firstValueFrom(
        this.authService.send(pattern, data)
      );
    } catch (error) {
      const err = error as any;
      let status = Number(err.status);
      if (isNaN(status) || status < 100 || status > 599) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      throw new HttpException(
        err.message || 'Erreur serveur',
        status
      );
    }
  }
} 