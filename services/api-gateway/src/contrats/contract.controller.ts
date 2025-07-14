import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateContratDto } from '../application/dtos/contrat/create-contrat.dto';
import { UpdateContratDto } from '../application/dtos/contrat/update-contrat.dto';
import { SignatureContratDto } from '../application/dtos/contrat/signature-contrat.dto';
import { ResiliationContratDto } from '../application/dtos/contrat/resiliation-contrat.dto';
import { SuspensionContratDto } from '../application/dtos/contrat/suspension-contrat.dto';
import { RenouvellementContratDto } from '../application/dtos/contrat/renouvellement-contrat.dto';
import { LienAbonnementDto, LienCompteurDto, LienClientDto } from '../application/dtos/contrat/lien-contrat.dto';
import { CreateCosignataireDto, UpdateCosignataireDto } from '../application/dtos/contrat/cosignataire.dto';
import { CreateContratDraftDto } from '../application/dtos/contrat/create-contrat-draft.dto';
import { AssignCompteurDto } from '../application/dtos/contrat/assign-compteur.dto';

@ApiTags('contrats')
@ApiBearerAuth()
@Controller('contrats')
export class ContractController {
  constructor(
    @Inject('CONTRACT_SERVICE') private readonly contractService: ClientProxy,
  ) {}

  // === CRUD CONTRATS ===
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les contrats' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async findAll(@Query() query: any, @Req() request: any) {
    return this.handleRequest('contrat.findAll', { ...query, context: this.extractContext(request) });
  }

  @Get('search/avancee')
  @ApiOperation({ summary: 'Recherche avancée de contrats' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  async searchContrats(@Query() query: any, @Req() request: any) {
    return this.handleRequest('contrat.searchContrats', { ...query, context: this.extractContext(request) });
  }

  @Get('stats/contrats')
  @ApiOperation({ summary: 'Statistiques des contrats' })
  @ApiResponse({ status: 200, description: 'Statistiques' })
  async getContratStats(@Req() request: any) {
    return this.handleRequest('contrat.getContratStats', { context: this.extractContext(request) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contrat par ID' })
  @ApiResponse({ status: 200, description: 'Contrat trouvé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async findById(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.findById', { id, context: this.extractContext(request) });
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contrat' })
  @ApiResponse({ status: 201, description: 'Contrat créé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() dto: CreateContratDto, @Req() request: any) {
    return this.handleRequest('contrat.create', { ...dto, context: this.extractContext(request) });
  }

  @Post('draft')
  @ApiOperation({ summary: 'Créer un brouillon de contrat' })
  @ApiResponse({ status: 201, description: 'Brouillon créé' })
  async createDraft(@Body() dto: CreateContratDraftDto, @Req() request: any) {
    return this.handleRequest('contrat.createDraft', { ...dto, context: this.extractContext(request) });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat mis à jour' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async update(@Param('id') id: string, @Body() dto: UpdateContratDto, @Req() request: any) {
    return this.handleRequest('contrat.update', { id, ...dto, context: this.extractContext(request) });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat supprimé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async delete(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.delete', { id, context: this.extractContext(request) });
  }

  // === COSIGNATAIRES ===
  @Get(':id/cosignataires')
  @ApiOperation({ summary: 'Récupérer les cosignataires d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Liste des cosignataires' })
  async getCosignataires(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.getCosignatairesByContrat', { contratId: id, context: this.extractContext(request) });
  }

  @Post(':id/cosignataires')
  @ApiOperation({ summary: 'Ajouter un cosignataire à un contrat' })
  @ApiResponse({ status: 201, description: 'Cosignataire ajouté' })
  async createCosignataire(@Param('id') contratId: string, @Body() dto: CreateCosignataireDto, @Req() request: any) {
    return this.handleRequest('contrat.createCosignataire', { contratId, ...dto, context: this.extractContext(request) });
  }

  @Put('cosignataires/:cosignataireId')
  @ApiOperation({ summary: 'Mettre à jour un cosignataire' })
  @ApiResponse({ status: 200, description: 'Cosignataire mis à jour' })
  async updateCosignataire(@Param('cosignataireId') cosignataireId: string, @Body() dto: UpdateCosignataireDto, @Req() request: any) {
    return this.handleRequest('contrat.updateCosignataire', { cosignataireId, ...dto, context: this.extractContext(request) });
  }

  @Post('cosignataires/:cosignataireId/signature')
  @ApiOperation({ summary: 'Signer en tant que cosignataire' })
  @ApiResponse({ status: 200, description: 'Signature effectuée' })
  async signCosignataire(@Param('cosignataireId') cosignataireId: string, @Req() request: any) {
    return this.handleRequest('contrat.signCosignataire', { cosignataireId, context: this.extractContext(request) });
  }

  @Post(':id/cosignataires/:cosignataireId/invitation')
  @ApiOperation({ summary: 'Envoyer une invitation de signature à un cosignataire spécifique' })
  @ApiResponse({ status: 200, description: 'Invitation envoyée' })
  @ApiResponse({ status: 404, description: 'Cosignataire ou contrat non trouvé' })
  async sendSignatureInvitation(@Param('id') id: string, @Param('cosignataireId') cosignataireId: string, @Body() data: any, @Req() request: any) {
    return this.handleRequest('contrat.sendSignatureInvitation', { contratId: id, cosignataireId, ...data, context: this.extractContext(request) });
  }

  @Post(':id/cosignataires/invitations')
  @ApiOperation({ summary: 'Envoyer des invitations de signature à tous les cosignataires du contrat' })
  @ApiResponse({ status: 200, description: 'Invitations envoyées' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async sendAllSignatureInvitations(@Param('id') id: string, @Body() data: any, @Req() request: any) {
    return this.handleRequest('contrat.sendAllSignatureInvitations', { contratId: id, ...data, context: this.extractContext(request) });
  }

  // === SIGNATURE ===
  @Post(':id/signature')
  @ApiOperation({ summary: 'Signer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat signé' })
  async signContrat(@Param('id') id: string, @Body() dto: SignatureContratDto, @Req() request: any) {
    return this.handleRequest('contrat.signContrat', { id, ...dto, context: this.extractContext(request) });
  }

  @Get('signature/validate/:token')
  @ApiOperation({ summary: 'Valider un token de signature' })
  @ApiResponse({ status: 200, description: 'Token valide, informations de signature' })
  @ApiResponse({ status: 401, description: 'Token invalide ou expiré' })
  async validateSignatureToken(@Param('token') token: string) {
    return this.handleRequest('contrat.validateSignatureToken', { token });
  }

  @Post('signature')
  @ApiOperation({ summary: 'Traiter une signature' })
  @ApiResponse({ status: 200, description: 'Signature traitée' })
  @ApiResponse({ status: 400, description: 'Données de signature invalides' })
  async processSignature(@Body() data: any) {
    return this.handleRequest('contrat.processSignature', data);
  }

  // === RÉSILIATION ===
  @Post(':id/resiliation')
  @ApiOperation({ summary: 'Résilier un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat résilié' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async resilierContrat(@Param('id') id: string, @Body() dto: ResiliationContratDto, @Req() request: any) {
    return this.handleRequest('contrat.resilierContrat', { id, ...dto, context: this.extractContext(request) });
  }

  // === SUSPENSION ===
  @Post(':id/suspension')
  @ApiOperation({ summary: 'Suspendre un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat suspendu' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async suspendreContrat(@Param('id') id: string, @Body() dto: SuspensionContratDto, @Req() request: any) {
    return this.handleRequest('contrat.suspendreContrat', { id, ...dto, context: this.extractContext(request) });
  }

  // === RENOUVELLEMENT ===
  @Post(':id/renouvellement')
  @ApiOperation({ summary: 'Renouveler un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat renouvelé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async renouvelerContrat(@Param('id') id: string, @Body() dto: RenouvellementContratDto, @Req() request: any) {
    return this.handleRequest('contrat.renouvelerContrat', { id, ...dto, context: this.extractContext(request) });
  }

  // === FINALISATION ===
  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finaliser un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat finalisé et activé' })
  @ApiResponse({ status: 400, description: 'Validation échouée, le contrat ne peut pas être finalisé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async finalizeContrat(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.finalizeContrat', { id, context: this.extractContext(request) });
  }

  // === LIENS ===
  @Post(':id/abonnements')
  @ApiOperation({ summary: 'Lier un abonnement à un contrat' })
  @ApiResponse({ status: 200, description: 'Abonnement lié' })
  async lierAbonnement(@Param('id') id: string, @Body() dto: LienAbonnementDto, @Req() request: any) {
    return this.handleRequest('contrat.lierAbonnement', { id, ...dto, context: this.extractContext(request) });
  }

  @Post(':id/compteurs')
  @ApiOperation({ summary: 'Lier un compteur à un contrat' })
  @ApiResponse({ status: 200, description: 'Compteur lié' })
  async lierCompteur(@Param('id') id: string, @Body() dto: LienCompteurDto, @Req() request: any) {
    return this.handleRequest('contrat.lierCompteur', { id, ...dto, context: this.extractContext(request) });
  }

  @Delete(':id/compteurs')
  @ApiOperation({ summary: 'Dissocier le compteur d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Compteur dissocié' })
  async dissocierCompteur(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.dissocierCompteur', { id, context: this.extractContext(request) });
  }

  @Post('compteurs/generer')
  @ApiOperation({ summary: 'Générer un compteur virtuel basé sur une adresse et une zone' })
  @ApiResponse({ status: 201, description: 'Compteur virtuel généré' })
  async generateVirtualMeter(@Body() data: { adresse: any, zone: string }, @Req() request: any) {
    return this.handleRequest('contrat.generateVirtualMeter', { ...data, context: this.extractContext(request) });
  }

  @Post(':id/compteurs/assign')
  @ApiOperation({ summary: 'Assigner un compteur à un contrat' })
  @ApiResponse({ status: 200, description: 'Compteur assigné' })
  @ApiResponse({ status: 404, description: 'Contrat ou compteur non trouvé' })
  async assignCompteur(@Param('id') contratId: string, @Body() dto: AssignCompteurDto, @Req() request: any) {
    return this.handleRequest('contrat.assignCompteur', { contratId, ...dto, context: this.extractContext(request) });
  }

  // === AUDIT & HISTORIQUE ===
  @Get(':id/audit')
  @ApiOperation({ summary: 'Récupérer l\'audit trail d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Audit trail' })
  async getAuditTrail(@Param('id') id: string, @Query() query: any, @Req() request: any) {
    return this.handleRequest('contrat.getAuditTrail', { id, options: query, context: this.extractContext(request) });
  }

  @Get(':id/compteurs/historique')
  @ApiOperation({ summary: 'Récupérer l\'historique des compteurs d\'un contrat' })
  @ApiResponse({ status: 200, description: 'Historique des compteurs' })
  async getCompteurHistorique(@Param('id') id: string, @Req() request: any) {
    return this.handleRequest('contrat.getCompteurHistorique', { id, context: this.extractContext(request) });
  }

  // === MÉTHODES UTILITAIRES ===
  private async handleRequest(pattern: string, data: any) {
    try {
      return await firstValueFrom(
        this.contractService.send(pattern, data)
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

  private extractContext(request: any) {
    return {
      tenantId: request.headers['x-tenant-id'] || request.headers['tenant-id'],
      userId: request.headers['x-user-id'] || request.headers['user-id'],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };
  }
}