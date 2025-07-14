import { Injectable } from '@nestjs/common';
import { ContratRepository } from '@infrastructure/repositories/contrat.repository';
import { CosignataireRepository } from '@infrastructure/repositories/cosignataire.repository';
import { AuditService, AuditAction } from './audit.service';
import { InterServiceService } from './inter-service.service';
import { NumberGenerator } from './number-generator.service';
import { ContratMapper } from '../mappers/contrat.mapper';
import { ContratContext, ContratBaseDto } from './contrat.service';
import { ResiliationContratDto } from '@application/dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '@application/dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '@application/dtos/renouvellement-contrat.dto';
import { Logger } from '@nestjs/common';

/**
 * Service de commande pour les opérations de modification des contrats
 * Implémente le pattern CQRS pour séparer les opérations de lecture et d'écriture
 */
@Injectable()
export class ContratCommandService {
  private readonly logger = new Logger(ContratCommandService.name);

  constructor(
    private readonly repository: ContratRepository,
    private readonly cosignataireRepository: CosignataireRepository,
    private readonly auditService: AuditService,
    private readonly interServiceService: InterServiceService,
    private readonly numberGenerator: NumberGenerator,
  ) {}

  /**
   * Crée un nouveau contrat
   * @param dto Les données du contrat
   * @param context Le contexte d'exécution
   * @param options Options supplémentaires pour la création
   */
  async create(dto: ContratBaseDto, context: ContratContext, options: { skipValidation?: boolean } = {}) {
    // Valider les données externes (client, compteur, etc.) sauf si skipValidation est true
    if (dto.proprietaireId && !options.skipValidation) {
      const validation = await this.interServiceService.validateClient(dto.proprietaireId);
      if (!validation) {
        throw new Error(`Client invalide: ${dto.proprietaireId}`);
      }
    }

    // === TRAITEMENT DES COMPTEURS ===
    // Vérifier si un compteur est fourni dans meter.compteurId (cas frontend)
    if (dto.meter && dto.meter.compteurId) {
      // Vérifier si c'est un UUID valide
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.meter.compteurId);
      
      if (!isUUID) {
        // Si ce n'est pas un UUID valide, créer un compteur réel avec le numéro fourni
        this.logger.log(`Format non-UUID détecté pour le compteur: ${dto.meter.compteurId}`);
        
        try {
          // IMPORTANT: Passer le numéro de compteur pour qu'il soit utilisé dans la création
          const compteurGenere = await this.interServiceService.generateVirtualMeter({
            adresse: dto.eligibilite?.adresse || {},
            zone: dto.eligibilite?.zone || 'DEFAULT',
            numeroCompteur: dto.meter.compteurId, // Passer le numéro de compteur pour création
            tenantId: context.tenantId
          });
          
          // Le compteur est créé dans generateVirtualMeter, récupérer son ID pour le contrat
          this.logger.log(`Compteur créé avec succès: ${compteurGenere.id}`);
          dto.compteurId = compteurGenere.id;
        } catch (error) {
          this.logger.error(`Erreur lors de la création du compteur: ${error.message}`);
        }
      } else {
        // Si c'est déjà un UUID, l'utiliser directement
        dto.compteurId = dto.meter.compteurId;
      }
      
      // Nettoyer les données temporaires
      delete dto.meter;
    } 
    // Si aucun compteur n'est spécifié mais qu'on a une adresse, générer un compteur virtuel
    else if (!dto.compteurId && dto.eligibilite?.adresse) {
      try {
        // Ici on ne passe pas de numeroCompteur, un sera généré automatiquement
        const compteurVirtuel = await this.interServiceService.generateVirtualMeter({
          adresse: dto.eligibilite.adresse,
          zone: dto.eligibilite.zone || 'DEFAULT',
          tenantId: context.tenantId
        });

        if (compteurVirtuel && compteurVirtuel.id) {
          this.logger.log(`Compteur virtuel généré pour le contrat: ${compteurVirtuel.id} (${compteurVirtuel.numero})`);
          dto.compteurId = compteurVirtuel.id;
        }
      } catch (error) {
        this.logger.error(`Erreur lors de la génération du compteur virtuel: ${error.message}`, error.stack);
      }
    }

    // === TRAITEMENT DES INFOS BANCAIRES ===
    // Si des informations bancaires sont fournies
    if (dto.payment && dto.payment.rib) {
      // Utiliser soit proprietaireId direct, soit celui dans clientIdentity
      const clientId = dto.proprietaireId || (dto.clientIdentity && dto.clientIdentity.proprietaireId);
      
      if (clientId) {
        this.logger.log(`Mise à jour des informations bancaires du client ${clientId}`);
        
        try {
          await this.interServiceService.updateClientInfo(clientId, {
            rib: dto.payment.rib,
            updatedAt: new Date()
          });
          
          this.logger.log(`Informations bancaires du client mises à jour avec succès`);
        } catch (error) {
          this.logger.error(`Erreur lors de la mise à jour des infos bancaires: ${error.message}`);
        }
      }
      
      // Nettoyer les données temporaires
      delete dto.payment;
    }
    
    // Nettoyer d'autres champs temporaires qui ne sont pas dans le modèle
    if (dto.clientIdentity) {
      delete dto.clientIdentity;
    }

    // Préparer les données pour la création
    const data = {
      ...dto,
      createdBy: context.userId,
      updatedBy: context.userId,
      tenantId: context.tenantId,
    };

    // Créer le contrat
    const contrat = await this.repository.create(data);

    // Audit de la création
    await this.auditService.logAction({
      contratId: contrat.id,
      userId: context.userId,
      action: 'CREATION' as AuditAction,
      details: { data: dto },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      tenantId: context.tenantId,
    });

    // Créer les cosignataires si présents
    if (dto.cosignataires?.length) {
      for (const c of dto.cosignataires) {
        await this.cosignataireRepository.create({ ...c, contratId: contrat.id });
      }
    }

    // Si un compteur est spécifié, créer une intervention d'installation
    if (dto.compteurId) {
      await this.interServiceService.createIntervention({
        type: 'POSE_COMPTEUR', 
        contratId: contrat.id, 
        compteurId: dto.compteurId, 
        tenantId: context.tenantId, 
        createdBy: context.userId,
      });
    }

    return ContratMapper.toResponse(contrat);
  }

  /**
   * Met à jour un contrat existant
   * @param id L'identifiant du contrat
   * @param dto Les données à mettre à jour
   * @param context Le contexte d'exécution
   */
  async update(id: string, dto: any, context: ContratContext): Promise<any> {
    this.logger.log(`Mise à jour du contrat ${id}`);
    
    try {
      // Récupérer le contrat existant
      const contrat = await this.repository.findById(id, context.tenantId);
      if (!contrat) {
        throw new Error(`Contrat ${id} non trouvé`);
      }
      
      // === TRAITEMENT DES COMPTEURS ===
      // Si un compteur est fourni dans meter.compteurId
      if (dto.meter && dto.meter.compteurId) {
        this.logger.log(`Détection d'un compteur dans la requête: ${dto.meter.compteurId}`);
        
        // Vérifier si c'est un UUID valide
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.meter.compteurId);
        
        if (!isUUID) {
          // Si ce n'est pas un UUID valide, c'est un numéro de compteur à créer
          this.logger.log(`Format non-UUID détecté pour le compteur: ${dto.meter.compteurId}`);
          
          // Générer un compteur réel avec le numéro fourni
          const compteurGenere = await this.interServiceService.generateVirtualMeter({
            adresse: dto.eligibility?.adresse || contrat.adresse || {},
            zone: dto.eligibility?.zone || contrat.zone || 'DEFAULT',
            numeroCompteur: dto.meter.compteurId,
            tenantId: context.tenantId
          });
          
          this.logger.log(`Compteur créé avec succès: ${compteurGenere.id}`);
          
          // Associer le compteur au contrat
          dto.compteurId = compteurGenere.id;
        } else {
          // Si c'est déjà un UUID valide, l'utiliser directement
          dto.compteurId = dto.meter.compteurId;
        }
        
        // Nettoyer les données temporaires
        delete dto.meter;
      }
      
      // === TRAITEMENT DES INFOS BANCAIRES ===
      // Si des informations bancaires sont fournies
      if (dto.payment && dto.payment.rib) {
        this.logger.log(`Mise à jour des informations bancaires du client ${dto.clientIdentity?.proprietaireId}`);
        
        // Mise à jour des infos client si on a un identifiant
        if (dto.clientIdentity && dto.clientIdentity.proprietaireId) {
          await this.interServiceService.updateClientInfo(dto.clientIdentity.proprietaireId, {
            rib: dto.payment.rib,
            updatedAt: new Date()
          });
          
          this.logger.log(`Informations bancaires du client mises à jour avec succès`);
        }
        
        // Nettoyer les données temporaires
        delete dto.payment;
      }
      
      // Nettoyer d'autres champs temporaires qui ne sont pas dans le modèle
      if (dto.clientIdentity) {
        delete dto.clientIdentity;
      }

      // Garder une trace des valeurs avant modification pour l'audit
      const anciennesValeurs = {
        statut: contrat.statut,
        dateFin: contrat.dateFin,
        objet: contrat.objet,
        montantTotal: contrat.montantTotal,
      };

      // Mettre à jour le contrat
      const updated = await this.repository.update(id, {
        ...dto,
        updatedBy: context.userId,
        dateMaj: new Date(),
      }, context.tenantId);

      // Audit de la modification
      await this.auditService.logAction({
        contratId: id,
        userId: context.userId,
        action: 'MODIFICATION' as AuditAction,
        details: { anciennesValeurs, nouvellesValeurs: dto },
        tenantId: context.tenantId,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du contrat ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un contrat
   * @param id L'identifiant du contrat
   * @param context Le contexte d'exécution
   */
  async delete(id: string, context: ContratContext) {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) throw new Error('Contrat non trouvé');

    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'SUPPRESSION' as AuditAction,
      details: { contrat },
      tenantId: context.tenantId,
    });

    return this.repository.delete(id, context.tenantId);
  }

  /**
   * Ajoute un cosignataire au contrat
   * @param contratId L'identifiant du contrat
   * @param dto Les données du cosignataire
   * @param context Le contexte d'exécution
   */
  async createCosignataire(contratId: string, dto: any, context: ContratContext) {
    const contrat = await this.repository.findById(contratId, context.tenantId);
    if (!contrat) throw new Error('Contrat non trouvé');

    const cosignataire = await this.cosignataireRepository.create({
      ...dto,
      contratId,
      tenantId: context.tenantId,
    });

    await this.auditService.logAction({
      contratId,
      userId: context.userId,
      action: 'AJOUT_COSIGNATAIRE' as AuditAction,
      details: { cosignataire },
      tenantId: context.tenantId,
    });

    return cosignataire;
  }

  /**
   * Met à jour un cosignataire
   * @param cosignataireId L'identifiant du cosignataire
   * @param dto Les données à mettre à jour
   * @param context Le contexte d'exécution
   */
  async updateCosignataire(cosignataireId: string, dto: any, context: ContratContext) {
    const cosignataire = await this.cosignataireRepository.findById(cosignataireId);
    if (!cosignataire) throw new Error('Cosignataire non trouvé');

    const updated = await this.cosignataireRepository.update(cosignataireId, {
      ...dto,
      updatedBy: context.userId,
    });

    await this.auditService.logAction({
      contratId: cosignataire.contratId,
      userId: context.userId,
      action: 'MODIFICATION_COSIGNATAIRE' as AuditAction,
      details: { cosignataire, modifications: dto },
      tenantId: context.tenantId,
    });

    return updated;
  }

  /**
   * Enregistre une signature sur un contrat
   * @param id L'identifiant du contrat
   * @param dto Les données de signature
   * @param context Le contexte d'exécution
   */
  async signContrat(id: string, dto: any, context: ContratContext) {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) throw new Error(`Contrat ${id} non trouvé`);

    // Vérifier l'état du contrat
    if (contrat.statut !== 'EN_ATTENTE') {
      throw new Error(`Le contrat ${id} ne peut pas être signé (statut: ${contrat.statut})`);
    }

    // Enregistrer la signature dans le contrat
    await this.repository.update(id, {
      proprietaireSignature: true,
      dateSignatureProprietaire: new Date(),
      updatedBy: context.userId,
      dateMaj: new Date()
    }, context.tenantId);

    // Si le contrat a des cosignataires, vérifier leur statut de signature
    const cosignataires = await this.cosignataireRepository.findByContratId(id, context.tenantId);
    const tousLesCosignatairesOntSigne = !cosignataires.length || 
      cosignataires.every(c => c.signature);
    
    if (tousLesCosignatairesOntSigne) {
      this.logger.log(`Toutes les signatures sont complètes pour le contrat ${id}, mise à jour du statut`);
      
      // Mise à jour du contrat avec changement de statut
      const updateResult = await this.repository.update(id, {
        statutSignature: 'SIGNE',
        status: 'ACTIF',          // Potentiellement 'status' n'est pas le bon nom
        etat: 'ACTIF',            // Essayer un nom alternatif 'etat'
        statut: 'ACTIF',          // Essayer un nom alternatif 'statut'
        dateMaj: new Date()
      }, context.tenantId);
      
      // Vérifier et logger le résultat de la mise à jour
      this.logger.log(`Résultat de mise à jour du contrat ${id}:`, updateResult);
      
      // Récupérer le contrat mis à jour pour vérifier
      const contratMisAJour = await this.repository.findById(id, context.tenantId);
      this.logger.log(`État du contrat après mise à jour:`, {
        id: contratMisAJour.id,
        status: contratMisAJour.status,
        statut: contratMisAJour.statut,
        etat: contratMisAJour.etat,
        statutSignature: contratMisAJour.statutSignature
      });
    }

    // Tracer l'action dans l'audit
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'SIGNATURE' as AuditAction,
      details: { 
        cosignataireId: dto.cosignataireId,
        proprietaireId: dto.proprietaireId,
        methode: dto.methodeSignature || 'ELECTRONIQUE' 
      },
      tenantId: context.tenantId,
    });

    return this.repository.findById(id, context.tenantId);
  }

  /**
   * Lie un compteur à un contrat
   * @param id Identifiant du contrat
   * @param dto Données de liaison contenant l'identifiant du compteur
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async lierCompteur(id: string, dto: { compteurId: string }, context: ContratContext) {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) throw new Error(`Contrat ${id} non trouvé`);

    // Valider le compteur
    const compteurValide = await this.interServiceService.validateCompteur(dto.compteurId);
    if (!compteurValide) {
      throw new Error(`Le compteur ${dto.compteurId} n'est pas valide ou n'existe pas`);
    }

    // Vérifier si un autre contrat utilise déjà ce compteur
    const disponible = await this.interServiceService.checkCompteurAvailability(dto.compteurId);
    if (!disponible) {
      throw new Error(`Le compteur ${dto.compteurId} est déjà associé à un autre contrat`);
    }

    // Mettre à jour le contrat avec l'ID du compteur
    await this.repository.update(id, {
      compteurId: dto.compteurId,
      dateMaj: new Date(),
      updatedBy: context.userId,
    }, context.tenantId);

    // Tracer l'action dans l'audit
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'ASSOCIATION_COMPTEUR' as AuditAction,
      details: { compteurId: dto.compteurId },
      tenantId: context.tenantId,
    });

    return this.repository.findById(id, context.tenantId);
  }

  /**
   * Lie un abonnement à un contrat
   * @param id Identifiant du contrat
   * @param dto Données de liaison contenant l'identifiant de l'abonnement
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async lierAbonnement(id: string, dto: { abonnementId: string }, context: ContratContext) {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) throw new Error(`Contrat ${id} non trouvé`);

    // Valider l'abonnement
    // Note: vous devrez implémenter cette méthode dans interServiceService si elle n'existe pas déjà
    const abonnementValide = await this.interServiceService.validateAbonnement(dto.abonnementId);
    if (!abonnementValide) {
      throw new Error(`L'abonnement ${dto.abonnementId} n'est pas valide ou n'existe pas`);
    }

    // Mettre à jour le contrat avec l'ID de l'abonnement
    await this.repository.update(id, {
      abonnementId: dto.abonnementId,
      dateMaj: new Date(),
      updatedBy: context.userId,
    }, context.tenantId);

    // Tracer l'action dans l'audit
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'ASSOCIATION_ABONNEMENT' as AuditAction,
      details: { abonnementId: dto.abonnementId },
      tenantId: context.tenantId,
    });

    return this.repository.findById(id, context.tenantId);
  }

  /**
   * Résilie un contrat
   * @param id Identifiant du contrat
   * @param dto Données de résiliation
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async resilierContrat(id: string, dto: ResiliationContratDto, context: ContratContext) {
    // Validation que le contrat existe et n'est pas déjà résilié
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error(`Contrat ${id} non trouvé`);
    }
    
    if (contrat.statut === 'RESILIÉ') {
      throw new Error(`Le contrat ${id} est déjà résilié`);
    }

    // Mise à jour du statut du contrat
    await this.repository.update(id, {
      statut: 'RESILIÉ',
      dateResiliation: dto.dateResiliation,
      motifResiliation: dto.motifResiliation,
      updatedBy: dto.updatedBy || context.userId,
    }, context.tenantId);

    // Si le contrat a un compteur, le libérer
    if (contrat.compteurId) {
      const motif = 'Libération suite à résiliation de contrat';
      await this.repository.dissocierCompteur(id, contrat.compteurId, motif, context.tenantId);
      // Notifier le service compteur de la libération via InterServiceService
      await this.interServiceService.emitEvent('compteur.release', { id: contrat.compteurId });
    }

    // Création d'une entrée d'audit
    await this.auditService.logAction({
      contratId: id,
      userId: dto.updatedBy || context.userId,
      action: 'RESILIATION',
      details: {
        dateResiliation: dto.dateResiliation,
        motifResiliation: dto.motifResiliation,
        commentaire: dto.commentaire,
      },
      tenantId: context.tenantId,
    });

    // Envoyer notification au service d'opérations
    await this.interServiceService.notifyOperationService({
      action: 'contrat.resilié',
      contratId: id,
      tenantId: context.tenantId,
      userId: dto.updatedBy || context.userId
    });

    // Envoyer une notification email
    await this.interServiceService.emitEvent('contract.terminated', {
      contratId: id,
      dateResiliation: dto.dateResiliation,
      motif: dto.motifResiliation,
      tenantId: context.tenantId
    });

    return {
      success: true,
      message: `Contrat ${id} résilié avec succès`,
      contratId: id,
    };
  }

  /**
   * Suspend un contrat
   * @param id Identifiant du contrat
   * @param dto Données de suspension
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async suspendreContrat(id: string, dto: SuspensionContratDto, context: ContratContext) {
    // Validation que le contrat existe et est actif
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error(`Contrat ${id} non trouvé`);
    }
    
    if (contrat.statut !== 'ACTIF') {
      throw new Error(`Le contrat ${id} n'est pas actif et ne peut être suspendu`);
    }

    // Mise à jour du statut du contrat
    await this.repository.update(id, {
      statut: 'SUSPENDU',
      dateSuspension: dto.dateSuspension,
      motifSuspension: dto.motifSuspension,
      updatedBy: dto.updatedBy || context.userId,
    }, context.tenantId);

    // Création d'une entrée d'audit
    await this.auditService.logAction({
      contratId: id,
      userId: dto.updatedBy || context.userId,
      action: 'SUSPENSION',
      details: {
        dateSuspension: dto.dateSuspension,
        motifSuspension: dto.motifSuspension,
        commentaire: dto.commentaire,
      },
      tenantId: context.tenantId,
    });

    // Envoyer notification au service d'opérations
    await this.interServiceService.notifyOperationService({
      action: 'contrat.suspendu',
      contratId: id,
      tenantId: context.tenantId,
      userId: dto.updatedBy || context.userId
    });

    // Envoyer une notification email
    await this.interServiceService.emitEvent('contract.suspended', {
      contratId: id,
      dateSuspension: dto.dateSuspension,
      motif: dto.motifSuspension,
      tenantId: context.tenantId
    });

    return {
      success: true,
      message: `Contrat ${id} suspendu avec succès`,
      contratId: id,
    };
  }

  /**
   * Renouvelle un contrat en étendant sa période de validité
   * @param id Identifiant du contrat
   * @param dto Données de renouvellement
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async renouvelerContrat(id: string, dto: RenouvellementContratDto, context: ContratContext) {
    // Validation que le contrat existe et est actif ou proche de l'expiration
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error(`Contrat ${id} non trouvé`);
    }
    
    if (!['ACTIF', 'EN_COURS_EXPIRATION'].includes(contrat.statut)) {
      throw new Error(`Le contrat ${id} ne peut être renouvelé dans son état actuel`);
    }

    // Validation des dates
    const now = new Date();
    const dateDebut = new Date(dto.nouvelleDateDebut);
    const dateFin = new Date(dto.nouvelleDateFin);

    if (dateFin <= dateDebut) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }

    // Mise à jour des dates du contrat
    await this.repository.update(id, {
      dateDebut: dto.nouvelleDateDebut,
      dateFin: dto.nouvelleDateFin,
      statut: 'ACTIF', // Réactiver le contrat s'il était en cours d'expiration
      motifRenouvellement: dto.motifRenouvellement,
      updatedBy: dto.updatedBy || context.userId,
    }, context.tenantId);

    // Création d'une entrée d'audit
    await this.auditService.logAction({
      contratId: id,
      userId: dto.updatedBy || context.userId,
      action: 'RENOUVELLEMENT',
      details: {
        ancieneeDateDebut: contrat.dateDebut,
        ancienneDateFin: contrat.dateFin,
        nouvelleDateDebut: dto.nouvelleDateDebut,
        nouvelleDateFin: dto.nouvelleDateFin,
        motifRenouvellement: dto.motifRenouvellement,
        commentaire: dto.commentaire,
      },
      tenantId: context.tenantId,
    });

    // Envoyer notification au service d'opérations
    await this.interServiceService.notifyOperationService({
      action: 'contrat.renouvellé',
      contratId: id,
      tenantId: context.tenantId,
      userId: dto.updatedBy || context.userId
    });

    // Envoyer une notification email
    await this.interServiceService.emitEvent('contract.renewed', {
      contratId: id,
      nouvelleDateDebut: dto.nouvelleDateDebut,
      nouvelleDateFin: dto.nouvelleDateFin,
      motif: dto.motifRenouvellement,
      tenantId: context.tenantId
    });

    return {
      success: true,
      message: `Contrat ${id} renouvelé avec succès`,
      contratId: id,
    };
  }

  /**
   * Dissocie un compteur d'un contrat
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   * @returns Le contrat mis à jour
   */
  async dissocierCompteur(id: string, context: ContratContext) {
    // Validation que le contrat existe et a un compteur associé
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) {
      throw new Error(`Contrat ${id} non trouvé`);
    }
    
    if (!contrat.compteurId) {
      throw new Error(`Aucun compteur associé au contrat ${id}`);
    }

    // Conserver l'ID du compteur avant dissociation
    const compteurId = contrat.compteurId;
    const motif = 'Dissociation demandée par administrateur';

    // Dissocier le compteur dans notre base de données
    await this.repository.dissocierCompteur(id, compteurId, motif, context.tenantId);

    // Notifier le service compteur de la libération via InterServiceService
    await this.interServiceService.emitEvent('compteur.release', { id: compteurId });

    // Création d'une entrée d'audit
    await this.auditService.logAction({
      contratId: id,
      userId: context.userId,
      action: 'DISSOCIATION_COMPTEUR',
      details: {
        compteurId: compteurId,
        dateDissociation: new Date()
      },
      tenantId: context.tenantId,
    });

    // Envoyer notification au service d'opérations
    await this.interServiceService.notifyOperationService({
      action: 'compteur.dissocié',
      contratId: id,
      tenantId: context.tenantId,
      userId: context.userId
    });

    return {
      success: true,
      message: `Compteur ${compteurId} dissocié du contrat ${id} avec succès`,
      contratId: id,
      compteurId: compteurId,
    };
  }
}
