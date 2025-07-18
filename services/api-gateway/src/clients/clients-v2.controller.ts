import { Controller, Post, Body, Inject, HttpException, HttpStatus, Get, Param, Put, UseGuards, Headers, Query, Delete, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('clients-v2')
@Controller('clients/v2')
export class ClientsV2Controller {
  private readonly logger = new Logger(ClientsV2Controller.name);

  constructor(
    @Inject('AUTH_SERVICE_V2') private readonly authServiceV2: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Liste des clients' })
  @ApiResponse({ status: 200, description: 'Liste des clients récupérée' })
  @ApiBearerAuth()
  @Get()
  async getClients(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('statut') statut: string = '',
    @Headers('authorization') auth: string
  ) {
    this.logger.log(`[ClientsController] GET /clients/v2`);
    const token = auth?.split(' ')[1];
    return this.handleRequest('clients.list', { 
      token, 
      page, 
      limit, 
      search,
      type,
      statut
    });
  }

  @ApiOperation({ summary: 'Récupération d\'un client par ID' })
  @ApiResponse({ status: 200, description: 'Client récupéré' })
  @ApiBearerAuth()
  @Get(':id')
  async getClientById(@Param('id') id: string, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('clients.getById', { id, token });
  }

  @ApiOperation({ summary: 'Création d\'un client' })
  @ApiResponse({ status: 201, description: 'Client créé avec succès' })
  @ApiBearerAuth()
  @Post()
  async createClient(@Body() data: any, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('clients.create', { ...data, token });
  }

  @ApiOperation({ summary: 'Mise à jour d\'un client' })
  @ApiResponse({ status: 200, description: 'Client mis à jour' })
  @ApiBearerAuth()
  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() data: any, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('clients.update', { id, ...data, token });
  }

  @ApiOperation({ summary: 'Suppression d\'un client' })
  @ApiResponse({ status: 200, description: 'Client supprimé avec succès' })
  @ApiBearerAuth()
  @Delete(':id')
  async deleteClient(@Param('id') id: string, @Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.handleRequest('clients.delete', { id, token });
  }

  private async handleRequest(pattern: string, data: any) {
    try {
      // Simplification pour le débogage
      this.logger.log(`[ClientsV2Controller] Envoi du message RabbitMQ: ${pattern} avec données: ${JSON.stringify(data, (key, value) => key === 'token' ? 'TOKEN_HIDDEN' : value)}`);
      
      // Utilisation d'un timeout plus court pour éviter les attentes trop longues
      const result = await firstValueFrom(
        this.authServiceV2.send(pattern, data)
      );
      
      this.logger.log(`[ClientsV2Controller] Réponse reçue pour ${pattern}: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`[ClientsV2Controller] ERREUR dans ${pattern}: ${error.message}`);
      this.logger.error(`[ClientsV2Controller] Stack trace: ${error.stack}`);
      
      // Toujours renvoyer une erreur 500 pour simplifier le débogage
      throw new HttpException(
        `Erreur lors de la communication avec le service d'authentification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
