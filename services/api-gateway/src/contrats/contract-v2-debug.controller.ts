import { Controller, Get, Post, Param, Body, Query, Inject, HttpException, HttpStatus, Req, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { of } from 'rxjs';

@ApiTags('debug')
@Controller('debug/contrats/v2')
export class ContractV2DebugController {
  private readonly logger = new Logger(ContractV2DebugController.name);

  constructor(
    @Inject('CONTRACT_SERVICE_V2') private readonly contractService: ClientProxy,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: 'Vérifier la connexion avec le service contract-service-v2' })
  @ApiResponse({ status: 200, description: 'Service disponible' })
  async ping(@Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1] || null;
    this.logger.log(`Token pour ping: ${token ? 'Présent' : 'Absent'}`);
    return this.handleRequestWithDebug('ping', { token });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Récupérer tous les templates avec debug' })
  @ApiResponse({ status: 200, description: 'Liste des templates' })
  async findAllTemplates(@Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    this.logger.log(`Token extrait: ${token ? 'Présent' : 'Absent'}`);
    return this.handleRequestWithDebug('templates.list', { token });
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Récupérer tous les contrats avec debug' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async findAllContracts(@Query() query: any, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    this.logger.log(`Token extrait: ${token ? 'Présent' : 'Absent'}`);
    return this.handleRequestWithDebug('contracts.list', { token, filters: query });
  }

  private async handleRequestWithDebug(pattern: string, data: any) {
    this.logger.log(`Envoi de message RabbitMQ - Pattern: ${pattern}`);
    this.logger.log(`Données: ${JSON.stringify(data)}`);
    
    try {
      // Utilisation de timeout pour éviter les attentes infinies
      const response = await firstValueFrom(
        this.contractService.send(pattern, data).pipe(
          timeout(30000), // 30 secondes de timeout
          catchError(err => {
            this.logger.error(`Erreur RabbitMQ: ${err.message}`);
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
      
      this.logger.log(`Réponse reçue: ${JSON.stringify(response)}`);
      
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
      
      return {
        success: true,
        data: response && response.data ? response.data : response,
        debug: {
          pattern,
          requestData: data,
          responseTime: new Date().toISOString()
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      const err = error as any;
      this.logger.error(`Exception non gérée: ${err.message}`);
      
      let status = Number(err.status);
      if (isNaN(status) || status < 100 || status > 599) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      
      throw new HttpException(
        {
          message: err.message || 'Erreur serveur',
          debug: {
            pattern,
            requestData: data,
            error: err.toString(),
            stack: err.stack
          }
        },
        status
      );
    }
  }
}
