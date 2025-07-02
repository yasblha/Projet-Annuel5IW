import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('gateway')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Page d\'accueil de l\'API Gateway' })
  @ApiResponse({ status: 200, description: 'Message de bienvenue' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérification de l\'état de santé de l\'API Gateway' })
  @ApiResponse({ status: 200, description: 'API Gateway opérationnel' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString()
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'Liste des microservices disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des services' })
  getServices(): { services: string[] } {
    return {
      services: [
        'auth-service',
        'agency-service', 
        'contract-service',
        'invoice-service',
        'intervention-service',
        'mailer-service'
      ]
    };
  }
}
