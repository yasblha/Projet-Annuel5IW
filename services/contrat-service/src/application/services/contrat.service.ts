/**
 * ContratService - Façade pour les opérations de contrat
 * Délègue aux services spécialisés (Command, Query, etc.)
 */
import { Injectable } from '@nestjs/common';
import { ContratCommandService } from './contrat-command.service';
import { ContratQueryService } from './contrat-query.service';
import { CompteurService } from './compteur.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { InterServiceService } from './inter-service.service';
import { NumberGenerator } from './number-generator.service';

// Interfaces standardisées pour les DTOs
export interface ContratContext {
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContratBaseDto {
  proprietaireId: string;
  typeContrat?: string;
  zone?: string;
  adresse?: any;
  cosignataires?: any[];
  [key: string]: any;
}

export interface AssignCompteurDto {
  contratId: string;
  compteurId: string;
}

@Injectable()
export class ContratService {
  constructor(
    private readonly commandService: ContratCommandService,
    private readonly queryService: ContratQueryService,
    private readonly compteurService: CompteurService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly interServiceService: InterServiceService,
    private readonly numberGenerator: NumberGenerator,
  ) {}

  /**
   * Récupère un contrat par son ID
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   */
  async findById(id: string, context: ContratContext) {
    return this.queryService.findById(id, context);
  }

  /**
   * Récupère tous les contrats selon les critères spécifiés
   * @param options Options de filtrage et pagination
   * @param context Contexte d'exécution
   */
  async findAll(options: any, context: ContratContext) {
    // Intégrer le tenantId dans les options plutôt que de le passer séparément
    return this.queryService.findAll({
      ...options,
      tenantId: context.tenantId
    });
  }

  /**
   * Crée un nouveau contrat
   * @param dto Données du contrat à créer
   * @param context Contexte d'exécution
   */
  async create(dto: ContratBaseDto, context: ContratContext) {
    return this.commandService.create(dto, context);
  }

  /**
   * Crée un contrat avec un numéro métier généré automatiquement
   * @param dto Données du contrat
   * @param context Contexte d'exécution
   */
  async createWithMetierNumber(dto: ContratBaseDto, context: ContratContext) {
    // Générer un numéro métier
    const numeroMetier = await this.numberGenerator.generateContractNumber({
      typeContrat: dto.typeContrat || 'P',
      zone: dto.zone || '00'
    });
    
    // Créer le contrat avec le numéro métier
    return this.create({ ...dto, numero: numeroMetier }, context);
  }

  /**
   * Crée un brouillon de contrat
   * @param dto Données du brouillon
   * @param context Contexte d'exécution
   */
  async createDraft(dto: any, context: ContratContext) {
    // Ajouter les propriétés par défaut pour respecter ContratBaseDto
    const enhancedDto: ContratBaseDto = {
      ...dto,
      proprietaireId: dto.proprietaireId || '',  // Valeur par défaut pour satisfaire le type
      numero: `DRAFT_${Date.now()}_${Math.floor(Math.random() * 1000)}` // Numéro temporaire pour les brouillons
    };
    
    // Créer un brouillon avec statut = EN_ATTENTE, en ignorant la validation du client
    return this.commandService.create({
      ...enhancedDto,
      statut: 'EN_ATTENTE'
    }, context, { skipValidation: true });
  }

  /**
   * Met à jour un contrat existant
   * @param id Identifiant du contrat
   * @param dto Données à mettre à jour
   * @param context Contexte d'exécution
   */
  async update(id: string, dto: Partial<ContratBaseDto>, context: ContratContext) {
    return this.commandService.update(id, dto, context);
  }

  /**
   * Supprime un contrat
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   */
  async delete(id: string, context: ContratContext) {
    return this.commandService.delete(id, context);
  }

  /**
   * Ajoute un cosignataire au contrat
   * @param contratId Identifiant du contrat
   * @param dto Données du cosignataire
   * @param context Contexte d'exécution
   */
  async createCosignataire(contratId: string, dto: any, context: ContratContext) {
    return this.commandService.createCosignataire(contratId, dto, context);
  }

  /**
   * Met à jour un cosignataire
   * @param cosignataireId Identifiant du cosignataire
   * @param dto Données à mettre à jour
   * @param context Contexte d'exécution
   */
  async updateCosignataire(cosignataireId: string, dto: any, context: ContratContext) {
    return this.commandService.updateCosignataire(cosignataireId, dto, context);
  }

  /**
   * Enregistre une signature sur un contrat
   * @param id Identifiant du contrat
   * @param dto Données de signature
   * @param context Contexte d'exécution
   */
  async signContrat(id: string, dto: any, context: ContratContext) {
    return this.commandService.signContrat(id, dto, context);
  }
  
  /**
   * Finalise un contrat en le rendant actif
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   */
  async finalizeContrat(id: string, context: ContratContext) {
    // Vérifier si le contrat est prêt à être finalisé
    const contrat = await this.findById(id, context);
    
    // Générer un numéro métier si nécessaire
    let updatedContrat = contrat;
    if (!contrat.numero || contrat.numero.startsWith('DRAFT')) {
      const numeroMetier = await this.numberGenerator.generateContractNumber({
        typeContrat: contrat.typeContrat || 'C',
        zone: contrat.adresse?.codePostal?.substring(0, 2) || '00'
      });
      
      // Mettre à jour le contrat avec le numéro métier
      updatedContrat = await this.update(id, { 
        numero: numeroMetier,
        statut: 'ACTIF'
      }, context);
    }
    
    // Notifier la finalisation du contrat
    await this.notificationService.notifyContractFinalized({
      contratId: id,
      numero: updatedContrat.numero,
      proprietaireId: updatedContrat.proprietaireId,
      tenantId: context.tenantId
    });
    
    // Créer une intervention d'installation de compteur si nécessaire
    if (updatedContrat.compteurId) {
      await this.interServiceService.createIntervention({
        type: 'POSE_COMPTEUR',
        contratId: id,
        compteurId: updatedContrat.compteurId,
        description: `Installation du compteur pour le contrat ${updatedContrat.numero}`,
        priorite: 'HAUTE',
        tenantId: context.tenantId
      });
      
      // Notification de l'installation du compteur
      await this.notificationService.notifyMeterInstallation({
        contratId: id,
        numero: updatedContrat.numero,
        compteurId: updatedContrat.compteurId,
        proprietaireId: updatedContrat.proprietaireId,
        tenantId: context.tenantId
      });
    }
    
    // Audit de la finalisation
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'FINALISATION',
      details: { 
        statut: 'ACTIF',
        numero: updatedContrat.numero
      },
      tenantId: context.tenantId
    });
    
    return updatedContrat;
  }

  /**
   * Envoie une invitation à signer un contrat
   * @param id Identifiant du contrat
   * @param cosignataireId Identifiant du cosignataire
   * @param context Contexte d'exécution
   */
  async sendSignatureInvitation(id: string, cosignataireId: string, context: ContratContext) {
    const contrat = await this.findById(id, context);
    const cosignataires = await this.queryService.getCosignatairesByContrat(id, context);
    const cosignataire = cosignataires.find(c => c.id === cosignataireId);
    
    if (!cosignataire) {
      throw new Error(`Cosignataire ${cosignataireId} non trouvé pour le contrat ${id}`);
    }
    
    // Récupérer les informations du propriétaire
    const proprietaire = await this.interServiceService.getClientInfo(
      contrat.proprietaireId,
      context.tenantId
    );
    
    // Construire l'URL de base pour la signature
    const baseUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
    
    // Appeler la méthode avec les 4 arguments attendus
    await this.notificationService.notifyCosignataireSignature(
      cosignataire,
      contrat,
      proprietaire,
      baseUrl
    );
    
    // Mettre à jour le statut d'invitation du cosignataire
    await this.commandService.updateCosignataire(cosignataireId, {
      statutInvitation: 'ENVOYEE',
      dateInvitation: new Date()
    }, context);
    
    // Audit de l'envoi d'invitation
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'MODIFICATION_COSIGNATAIRE', 
      details: { 
        cosignataireId, 
        cosignataireEmail: cosignataire.email,
        typeModification: 'INVITATION_SIGNATURE'
      },
      tenantId: context.tenantId
    });
    
    return { success: true, message: `Invitation envoyée à ${cosignataire.email}` };
  }
  
  /**
   * Récupère les cosignataires d'un contrat
   * @param contratId Identifiant du contrat
   * @param context Contexte d'exécution
   */
  async getCosignataires(contratId: string, context: ContratContext) {
    // Passage du contexte complet plutôt que juste le tenantId
    return this.queryService.getCosignatairesByContrat(contratId, context);
  }
  
  /**
   * Assigne un compteur à un contrat
   * @param dto Données d'assignation
   * @param context Contexte d'exécution
   */
  async assignCompteur(dto: AssignCompteurDto, context: ContratContext) {
    const contrat = await this.findById(dto.contratId, context);
    if (!contrat) {
      throw new Error(`Contrat ${dto.contratId} non trouvé`);
    }
    
    const compteur = await this.compteurService.findOne(dto.compteurId);
    if (!compteur) {
      throw new Error(`Compteur ${dto.compteurId} non trouvé`);
    }
    
    // Mettre à jour le contrat avec le compteur assigné
    const updated = await this.update(dto.contratId, { 
      compteurId: dto.compteurId 
    }, context);
    
    // Audit de l'assignation
    await this.auditService.logAction({
      contratId: dto.contratId,
      userId: context.userId,
      action: 'ASSIGNATION_COMPTEUR',
      details: { compteurId: dto.compteurId },
      tenantId: context.tenantId
    });
    
    return updated;
  }

  /**
   * Récupère les compteurs associés à un contrat
   * @param contratId Identifiant du contrat
   */
  async getCompteursByContratId(contratId: string) {
    return this.compteurService.getCompteursByContratId(contratId);
  }

  /**
   * Récupère l'historique d'audit d'un contrat
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   * @param options Options de pagination
   */
  async getAuditTrail(id: string, context: ContratContext, options?: { page?: number; limit?: number }) {
    return this.queryService.getAuditTrail(id, context, options);
  }
  
  /**
   * Récupère l'historique des compteurs d'un contrat
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   */
  async getCompteurHistorique(id: string, context: ContratContext) {
    return this.queryService.getCompteurHistorique(id, context);
  }
}