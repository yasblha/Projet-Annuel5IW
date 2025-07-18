import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, HttpException, HttpStatus, Req, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateContractV2Dto } from '../application/dtos/contrat/v2/create-contract.dto';
import { CreateTemplateV2Dto } from '../application/dtos/contrat/v2/create-template.dto';
import { ValidateContractV2Dto } from '../application/dtos/contrat/v2/validate-contract.dto';

@ApiTags('contrats-v2')
@ApiBearerAuth()
@Controller('contrats/v2')
export class ContractV2Controller {
  private readonly logger = new Logger(ContractV2Controller.name);

  constructor(
    @Inject('CONTRACT_SERVICE_V2') private readonly contractService: ClientProxy,
  ) {}

  // === CRUD CONTRATS ===
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les contrats' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async findAll(@Query() query: any, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.list', { token, filters: query });
  }

  // === TEMPLATES DE CONTRATS ===
  @Get('templates')
  @ApiOperation({ summary: 'Récupérer tous les templates de contrats' })
  @ApiResponse({ status: 200, description: 'Liste des templates' })
  async findAllTemplates(@Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('templates.list', { token });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Récupérer un template par ID' })
  @ApiResponse({ status: 200, description: 'Template trouvé' })
  @ApiResponse({ status: 404, description: 'Template non trouvé' })
  async findTemplateById(@Param('id') id: string) {
    return this.handleRequest('templates.getById', { id });
  }

  @Post('templates')
  @ApiOperation({ summary: 'Créer un nouveau template de contrat' })
  @ApiResponse({ status: 201, description: 'Template créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createTemplate(@Body() createTemplateDto: CreateTemplateV2Dto, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('templates.create', { createTemplateDto, token });
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Mettre à jour un template de contrat' })
  @ApiResponse({ status: 200, description: 'Template mis à jour' })
  @ApiResponse({ status: 404, description: 'Template non trouvé' })
  async updateTemplate(@Param('id') id: string, @Body() updateTemplateDto: CreateTemplateV2Dto, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('templates.update', { id, updateTemplateDto, token });
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Supprimer un template de contrat' })
  @ApiResponse({ status: 200, description: 'Template supprimé' })
  @ApiResponse({ status: 404, description: 'Template non trouvé' })
  async deleteTemplate(@Param('id') id: string, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('templates.delete', { id, token });
  }

  // === CONTRAT PAR ID ===
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contrat par ID' })
  @ApiResponse({ status: 200, description: 'Contrat trouvé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async findOne(@Param('id') id: string, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.getById', { id, token });
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contrat' })
  @ApiResponse({ status: 201, description: 'Contrat créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createContractDto: CreateContractV2Dto, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.create', { 
      createContractDto: {
        ...createContractDto,
        token
      }
    });
  }

  // === VALIDATION ET SIGNATURE ===
  @Post(':id/validate')
  @ApiOperation({ summary: 'Valider un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat validé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async validate(@Param('id') id: string, @Body() validateDto: ValidateContractV2Dto, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.validate', { 
      id, 
      validateContractDto: { token: validateDto.token || token } 
    });
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Signer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat signé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async sign(@Param('id') id: string, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.sign', { id, token });
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Résilier un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat résilié' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async terminate(@Param('id') id: string, @Body() body: { reason?: string }, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.terminate', { id, token, reason: body?.reason });
  }

  // === GESTION DES COMPTEURS ===
  @Post(':id/meter')
  @ApiOperation({ summary: 'Associer un compteur à un contrat' })
  @ApiResponse({ status: 200, description: 'Compteur associé' })
  @ApiResponse({ status: 404, description: 'Contrat ou compteur non trouvé' })
  async updateMeter(@Param('id') id: string, @Body() data: { meterId: string }, @Req() request: any) {
    return this.handleRequest('contracts.updateMeter', { contractId: id, meterId: data.meterId });
  }

  // === HISTORIQUE DES CONTRATS ===
  @Get(':id/history')
  @ApiOperation({ summary: 'Récupérer l\'historique d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Historique du contrat' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async getContractHistory(@Param('id') id: string, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.handleRequest('contracts.history', { id, token });
  }

  // === MÉTHODES UTILITAIRES ===
  private async handleRequest(pattern: string, data: any) {
    this.logger.log(`Envoi de message RabbitMQ - Pattern: ${pattern}`);
    
    // Vérification du token
    if (data && data.token) {
      this.logger.log(`Token présent pour le pattern ${pattern}`);
    } else {
      this.logger.warn(`Token manquant pour le pattern ${pattern}`);
    }
    
    try {
      // Utilisation de timeout pour éviter les attentes infinies
      const response = await firstValueFrom(
        this.contractService.send(pattern, data).pipe(
          timeout(30000), // 30 secondes de timeout
          catchError(err => {
            this.logger.error(`Erreur RabbitMQ pour ${pattern}: ${err.message}`);
            if (err.name === 'TimeoutError') {
              return of({ 
                status: 'error', 
                code: 'TIMEOUT', 
                message: 'Le service contract-service-v2 n\'a pas répondu dans le délai imparti' 
              });
            }
            return of({ 
              status: 'error', 
              code: 'COMMUNICATION_ERROR', 
              message: `Erreur de communication: ${err.message}` 
            });
          })
        )
      );
      
      if (response && response.status === 'error') {
        let statusCode = HttpStatus.BAD_REQUEST;
        
        switch (response.code) {
          case 'NOT_FOUND':
            statusCode = HttpStatus.NOT_FOUND;
            break;
          case 'UNAUTHORIZED':
            statusCode = HttpStatus.UNAUTHORIZED;
            break;
          case 'FORBIDDEN':
            statusCode = HttpStatus.FORBIDDEN;
            break;
          case 'CONFLICT':
            statusCode = HttpStatus.CONFLICT;
            break;
          case 'VALIDATION_ERROR':
            statusCode = HttpStatus.BAD_REQUEST;
            break;
          case 'TIMEOUT':
            statusCode = HttpStatus.GATEWAY_TIMEOUT;
            break;
          case 'COMMUNICATION_ERROR':
            statusCode = HttpStatus.BAD_GATEWAY;
            break;
          default:
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        throw new HttpException(
          response.message || 'Une erreur est survenue',
          statusCode
        );
      }
      
      return response && response.data ? response.data : response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      const err = error as any;
      this.logger.error(`Exception non gérée pour ${pattern}: ${err.message}`);
      
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
