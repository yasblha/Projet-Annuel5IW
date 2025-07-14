import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { CreateFactureDto } from './dto/create-facture.dto';
import { EnregistrerPaiementDto, ModePaiement } from './dto/enregistrer-paiement.dto';
import { LotFacturationDto, TypeLotFacturation } from './dto/lot-facturation.dto';

@ApiTags('factures')
@Controller('factures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FactureController {
  constructor(@Inject('FACTURE_SERVICE') private factureServiceClient: ClientProxy) {}

  @ApiOperation({ summary: 'Créer une facture' })
  @ApiBody({ type: CreateFactureDto, description: 'Données de création de facture' })
  @ApiResponse({ status: 201, description: 'Facture créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Post()
  async create(@Body() createFactureDto: CreateFactureDto, @Req() request: AuthenticatedRequest) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.create', { createFactureDto, context })
    );
  }

  @ApiOperation({ summary: 'Récupérer les factures impayées' })
  @ApiResponse({ status: 200, description: 'Factures impayées récupérées avec succès' })
  @Get('impayees')
  async findUnpaid(@Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.factureServiceClient.send('facture.findUnpaid', { tenantId: request['tenantId'] })
    );
  }

  @ApiOperation({ summary: 'Récupérer une facture par ID' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiResponse({ status: 200, description: 'Facture récupérée avec succès' })
  @Get(':id')
  async findById(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.factureServiceClient.send('facture.findById', { id, tenantId: request['tenantId'] })
    );
  }

  @ApiOperation({ summary: 'Récupérer les factures par contrat' })
  @ApiParam({ name: 'contratId', description: 'ID du contrat' })
  @ApiResponse({ status: 200, description: 'Factures récupérées avec succès' })
  @Get('contrat/:contratId')
  async findByContrat(@Param('contratId') contratId: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.factureServiceClient.send('facture.findByContratId', { contratId, tenantId: request['tenantId'] })
    );
  }

  @ApiOperation({ summary: 'Récupérer les factures par client' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiResponse({ status: 200, description: 'Factures récupérées avec succès' })
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.factureServiceClient.send('facture.findByClientId', { clientId, tenantId: request['tenantId'] })
    );
  }

  @ApiOperation({ summary: 'Émettre une facture' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiResponse({ status: 200, description: 'Facture émise avec succès' })
  @Put(':id/emettre')
  async emettre(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.emettre', { id, context })
    );
  }

  @ApiOperation({ summary: 'Annuler une facture' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiBody({ description: 'Motif d\'annulation' })
  @ApiResponse({ status: 200, description: 'Facture annulée avec succès' })
  @Put(':id/annuler')
  async annuler(
    @Param('id') id: string,
    @Body() body: { motifAnnulation?: string },
    @Req() request: AuthenticatedRequest
  ) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      motifAnnulation: body.motifAnnulation
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.annuler', { id, context })
    );
  }

  @ApiOperation({ summary: 'Enregistrer un paiement sur une facture' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiBody({ type: EnregistrerPaiementDto, description: 'Informations sur le paiement' })
  @ApiResponse({ status: 200, description: 'Paiement enregistré avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou facture déjà payée' })
  @ApiResponse({ status: 404, description: 'Facture non trouvée' })
  @Post(':id/paiements')
  async enregistrerPaiement(
    @Param('id') id: string,
    @Body() paiementDto: EnregistrerPaiementDto,
    @Req() request: AuthenticatedRequest
  ) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.enregistrerPaiement', { id, paiementDto, context })
    );
  }

  @ApiOperation({ summary: 'Relancer les factures impayées' })
  @ApiBody({ description: 'Options de relance' })
  @ApiResponse({ status: 200, description: 'Relances effectuées avec succès' })
  @Post('relancer')
  async relancerFacturesImpayees(
    @Body() body: { joursDepuisEmission: number },
    @Req() request: AuthenticatedRequest
  ) {
    const options = {
      joursDepuisEmission: body.joursDepuisEmission || 30,
      tenantId: request.tenantId,
      userId: request.user.id
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.relancerImpayees', options)
    );
  }

  @ApiOperation({ summary: 'Rechercher des factures par période' })
  @ApiResponse({ status: 200, description: 'Factures récupérées avec succès' })
  @Get('periode')
  async findByPeriode(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @Req() request: AuthenticatedRequest
  ) {
    return firstValueFrom(
      this.factureServiceClient.send('facture.findByPeriode', { 
        debut, 
        fin, 
        tenantId: request['tenantId'] 
      })
    );
  }

  @ApiOperation({ summary: 'Générer un PDF pour une facture' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiResponse({ status: 200, description: 'PDF généré avec succès' })
  @Get(':id/pdf')
  async generatePDF(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.generatePDF', { factureId: id, context })
    );
  }

  @ApiOperation({ summary: 'Envoyer une notification de facture' })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @ApiBody({ description: 'Données de notification' })
  @ApiResponse({ status: 200, description: 'Notification envoyée avec succès' })
  @Post(':id/notifications')
  async envoyerNotification(
    @Param('id') id: string,
    @Body() body: { type: string, metaData?: Record<string, any> },
    @Req() request: AuthenticatedRequest
  ) {
    const data = {
      tenantId: request.tenantId,
      userId: request.user.id,
      ...body.metaData
    };

    return firstValueFrom(
      this.factureServiceClient.send('facture.envoyerNotification', { 
        factureId: id, 
        type: body.type, 
        data 
      })
    );
  }

  @ApiOperation({ summary: 'Créer un lot de facturation' })
  @ApiBody({ type: LotFacturationDto, description: 'Données du lot de facturation' })
  @ApiResponse({ status: 201, description: 'Lot de facturation créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Post('lots')
  async createLot(@Body() lotFacturationDto: LotFacturationDto, @Req() request: AuthenticatedRequest) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id
    };

    return firstValueFrom(
      this.factureServiceClient.send('lot-facturation.create', { lotFacturationDto, context })
    );
  }

  @ApiOperation({ summary: 'Générer les factures pour un lot de facturation' })
  @ApiParam({ name: 'id', description: 'ID du lot de facturation' })
  @ApiResponse({ status: 200, description: 'Factures générées avec succès' })
  @Post('lots/:id/generate')
  async generateLotFactures(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    const context = {
      tenantId: request.tenantId,
      userId: request.user.id
    };

    return firstValueFrom(
      this.factureServiceClient.send('lot-facturation.generate', { lotId: id, context })
    );
  }
}
