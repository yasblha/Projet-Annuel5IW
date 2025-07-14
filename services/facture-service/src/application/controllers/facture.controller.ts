import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { FactureService } from '../services/facture.service';
import { CreateFactureDto } from '../dtos/create-facture.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../infrastructure/guards/tenant.guard';
import { FactureMapper } from '../mappers/facture.mapper';
import { Request } from 'express';
import { CreatePaiementDto } from '../dtos/paiement.dto';

@Controller('factures')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  /**
   * Crée une nouvelle facture
   * @POST /factures
   */
  @Post()
  async create(@Body() createFactureDto: CreateFactureDto, @Req() request: Request) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    const result = await this.factureService.create(createFactureDto, context);
    return result;
  }

  /**
   * Récupère une facture par son ID
   * @GET /factures/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const facture = await this.factureService.findById(id, request['tenantId']);
    return FactureMapper.toResponse(facture);
  }

  /**
   * Récupère les factures par contrat
   * @GET /factures/contrat/:contratId
   */
  @Get('contrat/:contratId')
  async findByContrat(@Param('contratId') contratId: string, @Req() request: Request) {
    return this.factureService.findByContratId(contratId, request['tenantId']);
  }

  /**
   * Récupère les factures par client
   * @GET /factures/client/:clientId
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string, @Req() request: Request) {
    return this.factureService.findByClientId(clientId, request['tenantId']);
  }

  /**
   * Récupère les factures impayées
   * @GET /factures/impayees
   */
  @Get('impayees')
  async findUnpaid(@Req() request: Request) {
    return this.factureService.findUnpaid(request['tenantId']);
  }

  /**
   * Émet une facture (change le statut et notifie le client)
   * @PUT /factures/:id/emettre
   */
  @Put(':id/emettre')
  async emettre(@Param('id') id: string, @Req() request: Request) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    return this.factureService.emettreFacture(id, context);
  }

  /**
   * Annule une facture
   * @PUT /factures/:id/annuler
   */
  @Put(':id/annuler')
  async annuler(
    @Param('id') id: string,
    @Body() body: { motifAnnulation?: string },
    @Req() request: Request
  ) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      motifAnnulation: body.motifAnnulation
    };

    return this.factureService.annulerFacture(id, context);
  }

  /**
   * Enregistre un paiement pour une facture
   * @POST /factures/:id/paiements
   */
  @Post(':id/paiements')
  async enregistrerPaiement(
    @Param('id') id: string,
    @Body() paiementDto: CreatePaiementDto,
    @Req() request: Request
  ) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    return this.factureService.enregistrerPaiement(id, paiementDto, context);
  }

  /**
   * Relance les factures impayées
   * @POST /factures/relancer
   */
  @Post('relancer')
  async relancerFacturesImpayees(
    @Body() body: { joursDepuisEmission: number },
    @Req() request: Request
  ) {
    const options = {
      joursDepuisEmission: body.joursDepuisEmission || 30, // Par défaut, relance après 30 jours
      tenantId: request['tenantId'],
      userId: request.user?.['id']
    };

    return this.factureService.relancerFacturesImpayees(options);
  }

  /**
   * Envoie manuellement une notification par email concernant une facture
   * @POST /factures/:id/notifications
   */
  @Post(':id/notifications')
  async envoyerNotification(
    @Param('id') id: string,
    @Body() body: { type: 'FACTURE_EMISE' | 'FACTURE_PAIEMENT' | 'FACTURE_RELANCE', metaData?: Record<string, any> },
    @Req() request: Request
  ) {
    const context = {
      tenantId: request['tenantId'],
      userId: request.user?.['id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };

    // Vérifier que la facture existe
    const facture = await this.factureService.findById(id, request['tenantId']);
    if (!facture) {
      throw new Error('Facture non trouvée');
    }

    // Vérifier si un PDF est disponible ou en générer un si nécessaire
    let pdfPath = facture.pdfPath;
    if (!pdfPath) {
      // Générer le PDF si nécessaire
      try {
        pdfPath = await this.factureService.generatePDFForInvoice(id, context);
      } catch (error) {
        throw new Error(`Impossible de générer le PDF pour la notification : ${error.message}`);
      }
    }

    // Envoyer la notification
    return this.factureService.envoyerNotificationManuelle(id, body.type, {
      ...context,
      ...body.metaData,
      pdfPath
    });
  }
}
