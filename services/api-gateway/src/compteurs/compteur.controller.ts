import { Controller, Get, Post, Body, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { Request } from '@nestjs/common';

@Controller('compteurs')
export class CompteurController {
  constructor(
    @Inject('CONTRACT_SERVICE') private contractServiceClient: ClientProxy,
    @Inject('OPERATION_SERVICE') private operationServiceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest, @Query() query: any) {
    // S'assurer que le tenantId est inclus dans la requête
    const tenantId = req.tenantId;
    return this.contractServiceClient.send(
      { cmd: 'find_all_compteurs' },
      { ...query, tenantId }
    ).toPromise();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = req.tenantId;
    return this.contractServiceClient.send(
      { cmd: 'find_compteur_by_id' },
      { id, tenantId }
    ).toPromise();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/releves')
  async getReadings(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Query() query: any) {
    const tenantId = req.tenantId;
    return this.contractServiceClient.send(
      { cmd: 'find_compteur_readings' },
      { id, ...query, tenantId }
    ).toPromise();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-test-data')
  async generateTestData(@Request() req: AuthenticatedRequest) {
    const tenantId = req.tenantId;
    
    // Création de compteurs de test pour les contrats actifs
    return this.contractServiceClient.send(
      { cmd: 'generate_test_compteurs' },
      { tenantId, count: 10 }
    ).toPromise();
  }
}
