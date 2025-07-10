import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ContratService } from '@application/services/contrat.service';
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
import { MultiTenantService, TenantGuard } from '@application/services/multi-tenant.service';

@Controller('contrats')
@UseGuards(TenantGuard)
export class ContratController {
  constructor(
    private readonly contratService: ContratService,
    private readonly multiTenantService: MultiTenantService
  ) {}

  @Get()
  async findAll(@Query() query: any, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.findAll({
      ...query,
      tenantId: context.tenantId,
      userId: context.userId
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.findById(id, context.tenantId, context.userId);
  }

  @Post()
  async create(@Body() dto: CreateContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.create(dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Post('metier')
  async createWithMetierNumber(@Body() dto: CreateContratDto & { 
    typeContrat: 'I' | 'P' | 'C' | 'A';
    zone: string;
  }, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.createWithMetierNumber(dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Post('draft')
  async createDraft(@Body() dto: CreateContratDraftDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.createDraft(dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Post('assign-compteur')
  async assignCompteur(@Body() dto: AssignCompteurDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.assignCompteur(dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Post(':id/finalize')
  async finalizeContrat(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.finalizeContrat(id, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.update(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.delete(id, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === COSIGNATAIRES ===
  @Get(':id/cosignataires')
  async getCosignataires(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.getCosignatairesByContrat(id, context.tenantId);
  }

  @Post(':id/cosignataires')
  async createCosignataire(
    @Param('id') contratId: string,
    @Body() dto: CreateCosignataireDto,
    @Req() request: any
  ) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.createCosignataire(contratId, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Put('cosignataires/:cosignataireId')
  async updateCosignataire(
    @Param('cosignataireId') cosignataireId: string,
    @Body() dto: UpdateCosignataireDto,
    @Req() request: any
  ) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.updateCosignataire(cosignataireId, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === SIGNATURE ===
  @Post(':id/signature')
  async signContrat(@Param('id') id: string, @Body() dto: SignatureContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.signContrat(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === RÉSILIATION ===
  @Post(':id/resiliation')
  async resilierContrat(@Param('id') id: string, @Body() dto: ResiliationContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.resilierContrat(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === SUSPENSION ===
  @Post(':id/suspension')
  async suspendreContrat(@Param('id') id: string, @Body() dto: SuspensionContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.suspendreContrat(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === RENOUVELLEMENT ===
  @Post(':id/renouvellement')
  async renouvelerContrat(@Param('id') id: string, @Body() dto: RenouvellementContratDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.renouvelerContrat(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === LIENS ===
  @Post(':id/abonnements')
  async lierAbonnement(@Param('id') id: string, @Body() dto: LienAbonnementDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.lierAbonnement(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Post(':id/compteurs')
  async lierCompteur(@Param('id') id: string, @Body() dto: LienCompteurDto, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.lierCompteur(id, dto, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  @Delete(':id/compteurs')
  async dissocierCompteur(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.dissocierCompteur(id, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }

  // === AUDIT & HISTORIQUE ===
  @Get(':id/audit')
  async getAuditTrail(
    @Param('id') id: string,
    @Query() query: any,
    @Req() request: any
  ) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.getAuditTrail(id, {
      tenantId: context.tenantId,
      userId: context.userId
    }, {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      action: query.action,
      dateDebut: query.dateDebut ? new Date(query.dateDebut) : undefined,
      dateFin: query.dateFin ? new Date(query.dateFin) : undefined
    });
  }

  @Get(':id/compteurs/historique')
  async getCompteurHistorique(@Param('id') id: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.getCompteurHistorique(id, {
      tenantId: context.tenantId,
      userId: context.userId
    });
  }

  // === RECHERCHE AVANCÉE ===
  @Get('search/avancee')
  async searchContrats(@Query() query: any, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.searchContrats({
      search: query.search,
      statut: query.statut,
      dateDebut: query.dateDebut ? new Date(query.dateDebut) : undefined,
      dateFin: query.dateFin ? new Date(query.dateFin) : undefined,
      proprietaireId: query.proprietaireId,
      tenantId: context.tenantId,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10
    });
  }

  // === STATISTIQUES ===
  @Get('stats/contrats')
  async getContratStats(@Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.getContratStats({
      tenantId: context.tenantId,
      userId: context.userId
    });
  }

  // === SIGNATURE COSIGNATAIRE ===
  @Post('cosignataires/:cosignataireId/signature')
  async signCosignataire(@Param('cosignataireId') cosignataireId: string, @Req() request: any) {
    const context = this.multiTenantService.extractContext(request);
    return this.contratService.updateCosignataire(cosignataireId, {
      signatureElectronique: true,
      signatureDate: new Date(),
      statutInvitation: 'ACCEPTE',
    }, {
      tenantId: context.tenantId,
      userId: context.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
  }
} 