import { Injectable } from '@nestjs/common';
import { ContratRepository } from '@Database/repositories/contrat.repository';
import { CreateContratDto } from '../dtos/create-contrat.dto';
import { CreateContratDraftDto } from '../dtos/create-contrat-draft.dto';
import { AssignCompteurDto } from '../dtos/assign-compteur.dto';
import { UpdateContratDto } from '../dtos/update-contrat.dto';
import { ContratMapper } from '../mappers/contrat.mapper';
import { ContratValidator } from '../validators/contrat.validator';
import { CosignataireRepository } from '@Database/repositories/contrat.repository';
import { CreateCosignataireDto, UpdateCosignataireDto } from '../dtos/cosignataire.dto';
import { SignatureContratDto } from '../dtos/signature-contrat.dto';
import { ResiliationContratDto } from '../dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '../dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '../dtos/renouvellement-contrat.dto';
import { LienAbonnementDto, LienCompteurDto, LienClientDto } from '../dtos/lien-contrat.dto';
import { AuditService, AuditAction } from './audit.service';
import { InterServiceService } from './inter-service.service';
import { MultiTenantService } from './multi-tenant.service';
import { NumberGenerator } from './number-generator.service';

@Injectable()
export class ContratService {
  private readonly repository = new ContratRepository();
  private readonly cosignataireRepository = new CosignataireRepository();

  constructor(
    private readonly auditService: AuditService,
    private readonly interServiceService: InterServiceService,
    private readonly multiTenantService: MultiTenantService,
    private readonly numberGenerator: NumberGenerator,
    private readonly contratValidator: ContratValidator
  ) {}

  async findAll(query?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    tenantId?: string;
    userId?: string;
  }) {
    const tenantId = query?.tenantId;
    
    if (!query) {
      const contrats = await this.repository.findAll({ tenantId });
      return contrats.map(ContratMapper.toResponse);
    }
    
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where = query.search
      ? { numero: { $like: `%${query.search}%` } }
      : undefined;
      
    const contrats = await this.repository.findAll({ 
      offset, 
      limit, 
      where, 
      tenantId 
    });
    
    return contrats.map(ContratMapper.toResponse);
  }

  async findById(id: string, tenantId?: string, userId?: string): Promise<any> {
    const contrat = await this.repository.findById(id, tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // Vérifier l'accès multi-tenant
    if (tenantId && contrat.tenantId !== tenantId) {
      throw new Error('Accès non autorisé à ce contrat');
    }

    return ContratMapper.toResponse(contrat);
  }

  async create(dto: CreateContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Validation inter-services
    const validation = await this.interServiceService.validateContratCreation({
      clientId: dto.proprietaireId,
      compteurId: dto.compteurId,
      abonnementId: dto.abonnementId
    });

    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    // Ajouter le tenantId
    const contratData = this.multiTenantService.addTenantToData(dto, context.tenantId);
    contratData.createdBy = context.userId;
    contratData.updatedBy = context.userId;

    const contrat = await this.repository.create(contratData);

    // Audit trail
    await this.auditService.logAction({
      contratId: contrat.id,
      userId: context.userId,
      action: 'CREATION' as AuditAction,
      details: { contratData: dto },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Créer les cosignataires si fournis
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      for (const cosignataireDto of dto.cosignataires) {
        await this.createCosignataire(contrat.id, cosignataireDto, context);
      }
    }

    // Créer une intervention de pose si un compteur est associé
    if (dto.compteurId) {
      await this.lierCompteur(contrat.id, { compteurId: dto.compteurId }, context);
    }

    return ContratMapper.toResponse(contrat);
  }

  async update(id: string, dto: UpdateContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // Audit trail - sauvegarder les anciennes valeurs
    const anciennesValeurs = {
      statut: contrat.statut,
      dateFin: contrat.dateFin,
      objet: contrat.objet,
      montantTotal: contrat.montantTotal
    };

    const updatedContrat = await this.repository.update(id, {
      ...dto,
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'MODIFICATION' as AuditAction,
      details: {
        anciennesValeurs,
        nouvellesValeurs: dto
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }

  async delete(id: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<boolean> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    const deleted = await this.repository.delete(id, context.tenantId);

    if (deleted) {
      // Audit trail
      await this.auditService.logAction({
        contratId: id,
        userId: context.userId,
        action: 'SUPPRESSION' as AuditAction,
        details: { contratSupprime: ContratMapper.toResponse(contrat) },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });
    }

    return deleted;
  }

  async getCosignatairesByContrat(contratId: string, tenantId?: string): Promise<any[]> {
    return this.cosignataireRepository.findAllByContrat(contratId, tenantId);
  }

  async createCosignataire(contratId: string, dto: CreateCosignataireDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const cosignataire = await this.cosignataireRepository.create({
      ...dto,
      contratId,
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId
    });

    // Audit trail
    await this.auditService.logAction({
      contratId,
      userId: context.userId,
      action: 'AJOUT_COSIGNATAIRE' as AuditAction,
      details: { cosignataireData: dto },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Notifier le cosignataire
    if (dto.emailCosignataire) {
      await this.interServiceService.notifyCosignataire(
        dto.cosignataireId,
        `Vous avez été invité à signer le contrat ${contratId}`
      );
    }

    return cosignataire;
  }

  async updateCosignataire(id: string, dto: UpdateCosignataireDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const cosignataire = await this.cosignataireRepository.update(id, dto, context.tenantId);
    
    if (cosignataire) {
      // Audit trail
      await this.auditService.logAction({
        contratId: cosignataire.contratId,
        userId: context.userId,
        action: 'MODIFICATION_COSIGNATAIRE' as AuditAction,
        details: { cosignataireData: dto },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });
    }

    return cosignataire;
  }

  async signContrat(id: string, dto: SignatureContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }
    
    if (contrat.statutSignature === 'SIGNE') {
      throw new Error('Déjà signé');
    }

    const updatedContrat = await this.repository.update(id, {
      statutSignature: 'SIGNE',
      dateSignature: dto.dateSignature || new Date(),
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'SIGNATURE' as AuditAction,
      details: { 
        signataireId: dto.signataireId,
        dateSignature: dto.dateSignature || new Date()
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Notifier le client
    await this.interServiceService.notifyClient(
      contrat.proprietaireId,
      `Votre contrat ${contrat.numero} a été signé avec succès`
    );

    return ContratMapper.toResponse(updatedContrat);
  }

  async resilierContrat(id: string, dto: ResiliationContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }
    
    if (contrat.statut === 'RESILIE') {
      throw new Error('Déjà résilié');
    }

    const updatedContrat = await this.repository.update(id, {
      statut: 'RESILIE',
      dateResiliation: dto.dateResiliation || new Date(),
      motifResiliation: dto.motif,
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'RESILIATION' as AuditAction,
      details: { 
        motif: dto.motif,
        dateResiliation: dto.dateResiliation || new Date()
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Créer une intervention de dépose de compteur
    const currentCompteur = await this.repository.getCurrentCompteur(id, context.tenantId);
    if (currentCompteur) {
      await this.interServiceService.createIntervention({
        type: 'DEPOSE_COMPTEUR',
        contratId: id,
        compteurId: currentCompteur.compteurId,
        description: `Dépose de compteur suite à résiliation du contrat`,
        priorite: 'NORMALE'
      });
    }

    return ContratMapper.toResponse(updatedContrat);
  }

  async suspendreContrat(id: string, dto: SuspensionContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }
    
    if (contrat.statut === 'SUSPENDU') {
      throw new Error('Déjà suspendu');
    }

    const updatedContrat = await this.repository.update(id, {
      statut: 'SUSPENDU',
      motifResiliation: dto.motif,
      updatedBy: context.userId,
      dateMaj: dto.dateSuspension || new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'SUSPENSION' as AuditAction,
      details: { 
        motif: dto.motif,
        dateSuspension: dto.dateSuspension || new Date()
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }

  async renouvelerContrat(id: string, dto: RenouvellementContratDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    const updatedContrat = await this.repository.update(id, {
      dateDebut: dto.nouvelleDateDebut,
      dateFin: dto.nouvelleDateFin,
      statut: 'ACTIF',
      statutSignature: 'EN_ATTENTE',
      dateSignature: null,
      dateResiliation: null,
      motifResiliation: null,
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'RENOUVELLEMENT' as AuditAction,
      details: { 
        nouvelleDateDebut: dto.nouvelleDateDebut,
        nouvelleDateFin: dto.nouvelleDateFin
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }

  async lierAbonnement(id: string, dto: LienAbonnementDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // Valider l'abonnement
    const abonnementValide = await this.interServiceService.validateAbonnement(dto.abonnementId);
    if (!abonnementValide) {
      throw new Error('Abonnement invalide ou non actif');
    }

    const updatedContrat = await this.repository.update(id, { 
      abonnementId: dto.abonnementId,
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'ASSOCIATION_ABONNEMENT' as AuditAction,
      details: { abonnementId: dto.abonnementId },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }

  async lierCompteur(id: string, dto: LienCompteurDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // Valider le compteur
    const compteurValide = await this.interServiceService.validateCompteur(dto.compteurId);
    if (!compteurValide) {
      throw new Error('Compteur invalide ou non actif');
    }

    // Vérifier la disponibilité
    const compteurDisponible = await this.interServiceService.checkCompteurAvailability(dto.compteurId);
    if (!compteurDisponible) {
      throw new Error('Compteur déjà associé à un autre contrat');
    }

    const updatedContrat = await this.repository.update(id, { 
      compteurId: dto.compteurId,
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Créer l'historique
    await this.repository.createCompteurHistorique({
      contratId: id,
      compteurId: dto.compteurId,
      typeAction: 'ASSOCIATION',
      dateDebut: new Date(),
      motif: 'Association initiale',
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId
    });

    // Créer une intervention de pose
    await this.interServiceService.createIntervention({
      type: 'POSE_COMPTEUR',
      contratId: id,
      compteurId: dto.compteurId,
      description: `Pose de compteur ${dto.compteurId} pour le contrat ${contrat.numero}`,
      priorite: 'NORMALE'
    });

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'ASSOCIATION_COMPTEUR' as AuditAction,
      details: { compteurId: dto.compteurId },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }

  async dissocierCompteur(id: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    const currentCompteur = await this.repository.getCurrentCompteur(id, context.tenantId);
    if (!currentCompteur) {
      throw new Error('Aucun compteur associé à ce contrat');
    }

    // Dissocier le compteur
    await this.repository.dissocierCompteur(
      id, 
      currentCompteur.compteurId, 
      'Dissociation demandée',
      context.tenantId
    );

    // Créer une intervention de dépose
    await this.interServiceService.createIntervention({
      type: 'DEPOSE_COMPTEUR',
      contratId: id,
      compteurId: currentCompteur.compteurId,
      description: `Dépose de compteur ${currentCompteur.compteurId} du contrat ${contrat.numero}`,
      priorite: 'NORMALE'
    });

    // Audit trail
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'DISSOCIATION_COMPTEUR' as AuditAction,
      details: { compteurId: currentCompteur.compteurId },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return { success: true, message: 'Compteur dissocié avec succès' };
  }

  async getAuditTrail(contratId: string, context: {
    tenantId: string;
    userId?: string;
  }, options?: {
    page?: number;
    limit?: number;
    action?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }): Promise<any[]> {
    return this.repository.getAuditTrail(contratId, {
      ...options,
      tenantId: context.tenantId
    });
  }

  async getCompteurHistorique(contratId: string, context: {
    tenantId: string;
    userId?: string;
  }): Promise<any[]> {
    return this.repository.getCompteurHistorique(contratId, context.tenantId);
  }

  async searchContrats(criteria: {
    search?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
    proprietaireId?: string;
    tenantId: string;
    page?: number;
    limit?: number;
  }): Promise<{ contrats: any[]; total: number }> {
    return this.repository.searchContrats(criteria);
  }

  async getContratStats(context: {
    tenantId: string;
    userId?: string;
  }): Promise<any> {
    return this.repository.getContratStats(context.tenantId);
  }

  /**
   * Crée un contrat avec le nouveau format de numéro métier
   * Format: C-<TYPE>-<ZONE>-<YY>-<SEQ>
   * @param dto Données du contrat
   * @param context Contexte d'exécution
   * @returns Contrat créé avec numéro généré
   */
  async createWithMetierNumber(dto: CreateContratDto & { 
    typeContrat: 'I' | 'P' | 'C' | 'A'; // I=Individuel, P=Particulier, C=Collectivité, A=Administration
    zone: string; // Code zone (ex: TLS pour Toulouse)
  }, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Validation inter-services
    const validation = await this.interServiceService.validateContratCreation({
      clientId: dto.proprietaireId,
      compteurId: dto.compteurId,
      abonnementId: dto.abonnementId
    });

    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    // Générer le numéro de contrat selon le format métier
    const numero = await this.numberGenerator.nextContractNumber(
      dto.typeContrat, 
      dto.zone
    );

    // Ajouter le tenantId et le numéro généré
    const contratData = this.multiTenantService.addTenantToData({
      ...dto,
      numero,
      zone: dto.zone,
      typeContrat: dto.typeContrat
    }, context.tenantId);
    
    contratData.createdBy = context.userId;
    contratData.updatedBy = context.userId;

    const contrat = await this.repository.create(contratData);

    // Audit trail
    await this.auditService.logAction({
      contratId: contrat.id,
      userId: context.userId,
      action: 'CREATION' as AuditAction,
      details: { 
        contratData: dto,
        numeroGenere: numero,
        typeContrat: dto.typeContrat,
        zone: dto.zone
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Créer les cosignataires si fournis
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      for (const cosignataireDto of dto.cosignataires) {
        await this.createCosignataire(contrat.id, cosignataireDto, context);
      }
    }

    // Créer une intervention de pose si un compteur est associé
    if (dto.compteurId) {
      await this.lierCompteur(contrat.id, { compteurId: dto.compteurId }, context);
    }

    return ContratMapper.toResponse(contrat);
  }

  /**
   * Valide un numéro de contrat selon le format métier
   * @param numero Numéro à valider
   * @returns true si le format est valide
   */
  validateContractNumber(numero: string): boolean {
    return this.numberGenerator.validateContractNumber(numero);
  }

  /**
   * Extrait les composants d'un numéro de contrat
   * @param numero Numéro de contrat
   * @returns Objet avec les composants extraits ou null si invalide
   */
  parseContractNumber(numero: string): { type: string; zone: string; year: string; seq: number } | null {
    return this.numberGenerator.parseContractNumber(numero);
  }

  async createDraft(dto: CreateContratDraftDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Validation métier
    await this.contratValidator.validateDraftCreation(dto);

    // Ajouter le tenantId et marquer comme brouillon
    const contratData = this.multiTenantService.addTenantToData({
      ...dto,
      statut: 'EN_ATTENTE',
      statutSignature: 'EN_ATTENTE',
      numero: 'DRAFT_' + Date.now() // Numéro temporaire
    }, context.tenantId);
    
    contratData.createdBy = context.userId;
    contratData.updatedBy = context.userId;

    const contrat = await this.repository.create(contratData);

    // Audit trail
    await this.auditService.logAction({
      contratId: contrat.id,
      userId: context.userId,
      action: 'CREATION_BROUILLON' as AuditAction,
      details: { contratData: dto },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    // Créer les cosignataires si fournis
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      for (const cosignataireDto of dto.cosignataires) {
        await this.createCosignataire(contrat.id, cosignataireDto, context);
      }
    }

    return ContratMapper.toResponse(contrat);
  }

  async assignCompteur(dto: AssignCompteurDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(dto.contratId, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    if (contrat.statut !== 'EN_ATTENTE') {
      throw new Error('Seuls les contrats en attente peuvent recevoir un compteur');
    }

    // Validation inter-services
    const validation = await this.interServiceService.validateCompteurAssignment({
      contratId: dto.contratId,
      compteurId: dto.compteurId,
      tenantId: context.tenantId
    });

    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    // Lier le compteur
    await this.lierCompteur(dto.contratId, { compteurId: dto.compteurId }, context);

    // Audit trail
    await this.auditService.logAction({
      contratId: dto.contratId,
      userId: context.userId,
      action: 'ASSIGNATION_COMPTEUR' as AuditAction,
      details: { compteurId: dto.compteurId },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return this.findById(dto.contratId, context.tenantId, context.userId);
  }

  async finalizeContrat(contratId: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const contrat = await this.repository.findById(contratId, context.tenantId);
    if (!contrat) {
      throw new Error('Contrat non trouvé');
    }

    // Validation métier stricte
    await this.contratValidator.validateFinalization(contratId, context.tenantId);

    // Générer le numéro métier
    const numeroMetier = await this.numberGenerator.generateContractNumber({
      typeContrat: contrat.typeContrat,
      zone: contrat.zone,
      tenantId: context.tenantId
    });

    // Vérifier que le numéro n'existe pas déjà
    const existingContrat = await this.repository.findByNumero(numeroMetier, context.tenantId);
    if (existingContrat) {
      throw new Error('Numéro de contrat déjà existant');
    }

    // Mettre à jour le contrat avec le numéro métier et le statut actif
    const updatedContrat = await this.repository.update(contratId, {
      numero: numeroMetier,
      statut: 'ACTIF',
      statutSignature: 'SIGNE',
      dateSignature: new Date(),
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Appel à operation-service avec gestion d'erreur
    try {
      await this.interServiceService.notifyOperationService({
        action: 'CONTRAT_FINALISE',
        contratId: contratId,
        numero: numeroMetier,
        tenantId: context.tenantId
      });
    } catch (error) {
      // Rollback: marquer le contrat comme à réactiver
      await this.repository.update(contratId, {
        statut: 'EN_ATTENTE',
        statutSignature: 'EN_ATTENTE',
        updatedBy: context.userId,
        dateMaj: new Date()
      }, context.tenantId);
      
      throw new Error(`Erreur lors de la finalisation: ${error.message}`);
    }

    // Audit trail
    await this.auditService.logAction({
      contratId: contratId,
      userId: context.userId,
      action: 'FINALISATION' as AuditAction,
      details: { numeroMetier },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId
    });

    return ContratMapper.toResponse(updatedContrat);
  }
} 