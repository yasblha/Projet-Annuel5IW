import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ContratService, ContratContext, ContratBaseDto } from '@application/services/contrat.service';
import { CreateContratDto } from '@application/dtos/create-contrat.dto';
import { CreateContratDraftDto } from '@application/dtos/create-contrat-draft.dto';
import { AssignCompteurDto } from '@application/dtos/assign-compteur.dto';
import { UpdateContratDto } from '@application/dtos/update-contrat.dto';
import { SignatureContratDto } from '@application/dtos/signature-contrat.dto';
import { ResiliationContratDto } from '@application/dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '@application/dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '@application/dtos/renouvellement-contrat.dto';
import { LienAbonnementDto, LienCompteurDto, LienClientDto } from '@application/dtos/lien-contrat.dto';
import { CreateCosignataireDto, UpdateCosignataireDto } from '@application/dtos/cosignataire.dto';
import { InterServiceService } from '@application/services/inter-service.service';
import { NotificationService } from '@application/services/notification.service';
import { AuditService } from '@application/services/audit.service';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Contrôleur gérant toutes les routes liées aux contrats
 * Utilise les interfaces standardisées ContratContext et ContratBaseDto
 */
@ApiTags('contrats')
@Controller('contrats')
export class ContratController {
  constructor(
    private readonly contratService: ContratService,
    private readonly interServiceService: InterServiceService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Extraction du contexte d'exécution à partir de la requête
   * @param request Requête HTTP
   * @returns Contexte d'exécution standardisé
   */
  private extractContext(request: any): ContratContext {
    return {
      tenantId: request.tenantId,
      userId: request.user?.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les contrats' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async findAll(@Query() query: any, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.findAll({
      ...query,
      tenantId: context.tenantId
    }, context);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contrat par ID' })
  @ApiResponse({ status: 200, description: 'Contrat trouvé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async findById(@Param('id') id: string, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.findById(id, context);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contrat' })
  @ApiResponse({ status: 201, description: 'Contrat créé avec succès' })
  async create(@Body() dto: CreateContratDto, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.create(dto, context);
  }

  @Post('metier')
  @ApiOperation({ summary: 'Créer un nouveau contrat avec numéro de métier' })
  @ApiResponse({ status: 201, description: 'Contrat créé avec succès' })
  async createWithMetierNumber(@Body() dto: CreateContratDto & { 
    typeContrat: 'I' | 'P' | 'C' | 'A';
    zone: string;
  }, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.createWithMetierNumber(dto, context);
  }

  @Post('draft')
  @ApiOperation({ summary: 'Créer un nouveau contrat en brouillon' })
  @ApiResponse({ status: 201, description: 'Contrat créé avec succès' })
  async createDraft(@Body() dto: CreateContratDraftDto, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.createDraft(dto, context);
  }

  @Post('assign-compteur')
  @ApiOperation({ summary: 'Assigner un compteur à un contrat' })
  @ApiResponse({ status: 200, description: 'Compteur assigné avec succès' })
  async assignCompteur(@Body() dto: AssignCompteurDto, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.assignCompteur(dto, context);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finaliser un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat finalisé avec succès' })
  async finalizeContrat(@Param('id') id: string, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.finalizeContrat(id, context);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat mis à jour avec succès' })
  async update(@Param('id') id: string, @Body() dto: UpdateContratDto, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.update(id, dto, context);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat supprimé avec succès' })
  async delete(@Param('id') id: string, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.delete(id, context);
  }

  // === COSIGNATAIRES ===
  @Get(':id/cosignataires')
  @ApiOperation({ summary: 'Récupérer les cosignataires d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Liste des cosignataires' })
  async getCosignataires(@Param('id') id: string, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.getCosignataires(id, context);
  }

  @Post(':id/cosignataires')
  @ApiOperation({ summary: 'Ajouter un cosignataire à un contrat' })
  @ApiResponse({ status: 201, description: 'Cosignataire ajouté avec succès' })
  async createCosignataire(
    @Param('id') contratId: string,
    @Body() dto: CreateCosignataireDto,
    @Req() request: any
  ) {
    const context = this.extractContext(request);
    
    // Vérifier si les données minimales sont présentes
    if (!dto.cosignataireId && !dto.emailCosignataire) {
      return { 
        success: true, 
        message: 'Aucun cosignataire ajouté: données insuffisantes',
        skipped: true
      };
    }
    
    return this.contratService.createCosignataire(contratId, dto, context);
  }

  @Put('cosignataires/:cosignataireId')
  @ApiOperation({ summary: 'Mettre à jour un cosignataire' })
  @ApiResponse({ status: 200, description: 'Cosignataire mis à jour avec succès' })
  async updateCosignataire(
    @Param('cosignataireId') cosignataireId: string,
    @Body() dto: UpdateCosignataireDto,
    @Req() request: any
  ) {
    const context = this.extractContext(request);
    return this.contratService.updateCosignataire(cosignataireId, dto, context);
  }

  // === SIGNATURE ===
  @Post(':id/signature')
  @ApiOperation({ summary: 'Signer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat signé avec succès' })
  async signContrat(@Param('id') id: string, @Body() dto: SignatureContratDto, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.signContrat(id, dto, context);
  }

  // === INVITATIONS SIGNATURE ===
  @Post(':id/cosignataires/:cosignataireId/invitation')
  @ApiOperation({ summary: 'Envoyer une invitation de signature à un cosignataire' })
  @ApiResponse({ status: 200, description: 'Invitation envoyée avec succès' })
  async sendSignatureInvitation(
    @Param('id') contratId: string,
    @Param('cosignataireId') cosignataireId: string,
    @Req() request: any
  ) {
    const context = this.extractContext(request);
    return this.contratService.sendSignatureInvitation(contratId, cosignataireId, context);
  }

  @Post(':id/cosignataires/invitations')
  @ApiOperation({ summary: 'Envoyer des invitations de signature à tous les cosignataires' })
  @ApiResponse({ status: 200, description: 'Invitations envoyées avec succès' })
  async sendAllSignatureInvitations(@Param('id') contratId: string, @Req() request: any) {
    const context = this.extractContext(request);
    
    // Récupérer tous les cosignataires
    const cosignataires = await this.contratService.getCosignataires(contratId, context);
    
    // Envoyer une invitation à chaque cosignataire
    const results = [];
    for (const cosignataire of cosignataires) {
      try {
        const result = await this.contratService.sendSignatureInvitation(contratId, cosignataire.id, context);
        results.push({ cosignataire: cosignataire.id, success: true, result });
      } catch (error) {
        results.push({ cosignataire: cosignataire.id, success: false, error: error.message });
      }
    }
    
    return {
      contratId,
      invitationsSent: results.filter(r => r.success).length,
      invitationsFailed: results.filter(r => !r.success).length,
      details: results
    };
  }

  @Get('signature/validate-token')
  @ApiOperation({ summary: 'Valider un token de signature' })
  @ApiResponse({ status: 200, description: 'Token valide' })
  async validateSignatureToken(@Query('token') token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return { 
        valid: true, 
        data: decoded 
      };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Token invalide ou expiré' 
      };
    }
  }

  // === AUDIT ===
  @Get(':id/audit')
  @ApiOperation({ summary: 'Récupérer l\'historique d\'audit d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Historique d\'audit' })
  async getAuditTrail(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Req() request: any
  ) {
    const context = this.extractContext(request);
    return this.contratService.getAuditTrail(id, context, { page, limit });
  }

  // === COMPTEUR ===
  @Get(':id/compteur/historique')
  @ApiOperation({ summary: 'Récupérer l\'historique des compteurs d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Historique des compteurs' })
  async getCompteurHistorique(@Param('id') id: string, @Req() request: any) {
    const context = this.extractContext(request);
    return this.contratService.getCompteurHistorique(id, context);
  }
}