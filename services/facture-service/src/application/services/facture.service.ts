import { Injectable } from '@nestjs/common';
import { FactureRepositoryAdapter } from '@infrastructure/repositories/facture.repository.adapter';
import { LigneFactureRepositoryAdapter } from '@infrastructure/repositories/ligne-facture.repository.adapter';
import { PaiementRepositoryAdapter } from '@infrastructure/repositories/paiement.repository.adapter';
import { CreateFactureDto } from '../dtos/create-facture.dto';
import { FactureMapper } from '../mappers/facture.mapper';
import { AuditService, AuditAction } from './audit.service';
import { InterServiceService } from './inter-service.service';
import { MultiTenantService } from './multi-tenant.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { FactureStatut } from '@domain/enums/facture-statut.enum';
import { LigneFactureType } from '@domain/enums/ligne-facture-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize, Op } from 'sequelize';
import { models } from '@Database/sequelize';

/**
 * Service pour la gestion des factures
 */
@Injectable()
export class FactureService {
  constructor(
    private readonly repository: FactureRepositoryAdapter,
    private readonly ligneFactureRepository: LigneFactureRepositoryAdapter,
    private readonly paiementRepository: PaiementRepositoryAdapter,
    private readonly auditService: AuditService,
    private readonly interServiceService: InterServiceService,
    private readonly multiTenantService: MultiTenantService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Crée une facture avec ses lignes
   */
  async create(dto: CreateFactureDto, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    // Si un contrat est spécifié, récupérer les infos du client
    if (dto.contratId && !dto.clientId) {
      try {
        const contrat = await this.interServiceService.getContratById(dto.contratId);
        dto.clientId = contrat.proprietaireId;
      } catch (error) {
        console.error(`Erreur lors de la récupération des informations du contrat:`, error);
        // On continue sans clientId si le service contrat n'est pas disponible
      }
    }

    // Générer un numéro de facture unique si non fourni
    if (!dto.numero) {
      const now = new Date();
      const prefix = `F${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      dto.numero = `${prefix}-${randomSuffix}`;
    }

    // Ajouter les dates par défaut si non fournies
    const now = new Date();
    if (!dto.dateEmission) {
      dto.dateEmission = now;
    }
    if (!dto.dateEcheance) {
      // Par défaut : échéance à 30 jours
      const dateEcheance = new Date(now);
      dateEcheance.setDate(dateEcheance.getDate() + 30);
      dto.dateEcheance = dateEcheance;
    }

    // Statut par défaut
    dto.statut = dto.statut || FactureStatut.BROUILLON;

    // Préparer les lignes de facture
    const lignes = dto.lignes || [];
    delete dto.lignes;

    // Calcul des totaux si non fournis
    if (lignes.length > 0 && (!dto.montantHT || !dto.montantTTC)) {
      let totalHT = 0;
      let totalTVA = 0;
      
      lignes.forEach(ligne => {
        totalHT += ligne.montantHT;
        totalTVA += ligne.montantTVA || 0;
      });
      
      dto.montantHT = dto.montantHT || totalHT;
      dto.montantTVA = dto.montantTVA || totalTVA;
      dto.montantTTC = dto.montantTTC || (totalHT + totalTVA);
    }

    // Transaction Sequelize pour assurer l'atomicité
    const transaction = await models.sequelize.transaction();

    try {
      // Ajouter le tenantId et autres métadonnées
      const factureData = this.multiTenantService.addTenantToData({
        ...dto,
        id: uuidv4(),
        createdBy: context.userId,
        updatedBy: context.userId,
        dateCreation: now,
        dateMaj: now
      }, context.tenantId);

      // Créer la facture
      const facture = await this.repository.create(factureData);

      // Créer les lignes de facture
      if (lignes.length > 0) {
        const lignesFacture = lignes.map((ligne, index) => ({
          id: uuidv4(),
          factureId: facture.id,
          libelle: ligne.libelle,
          type: ligne.type,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prixUnitaire,
          montantHT: ligne.montantHT,
          tauxTVA: ligne.tauxTVA || 5.5, // TVA par défaut pour l'eau
          montantTVA: ligne.montantTVA || (ligne.montantHT * (ligne.tauxTVA || 5.5) / 100),
          montantTTC: ligne.montantTTC || (ligne.montantHT + (ligne.montantTVA || (ligne.montantHT * (ligne.tauxTVA || 5.5) / 100))),
          ordre: ligne.ordre || index + 1,
          reference: ligne.reference,
          details: ligne.details,
          createdBy: context.userId,
          updatedBy: context.userId,
          dateCreation: now,
          dateMaj: now,
          tenantId: context.tenantId
        }));

        await this.ligneFactureRepository.bulkCreate(lignesFacture, { transaction });
      }

      // Commit de la transaction
      await transaction.commit();

      // Audit trail
      await this.auditService.logAction({
        factureId: facture.id,
        userId: context.userId,
        action: 'CREATION' as AuditAction,
        details: { factureData: dto },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });

      // Récupérer la facture complète avec ses lignes
      const factureComplete = await this.findById(facture.id, context.tenantId);
      
      return FactureMapper.toResponse(factureComplete);
    } catch (error) {
      // Rollback en cas d'erreur
      await transaction.rollback();
      console.error('Erreur lors de la création de la facture:', error);
      throw new Error(`Erreur lors de la création de la facture: ${error.message}`);
    }
  }

  /**
   * Récupère une facture par son ID
   */
  async findById(id: string, tenantId: string): Promise<any> {
    const facture = await this.repository.findById(id);
    
    if (!facture || facture.tenantId !== tenantId) {
      throw new Error('Facture non trouvée');
    }

    return facture;
  }

  /**
   * Émet une facture (change son statut et envoie une notification)
   */
  async emettreFacture(id: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const facture = await this.findById(id, context.tenantId);
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    if (facture.statut !== FactureStatut.BROUILLON) {
      throw new Error('Seules les factures en brouillon peuvent être émises');
    }
    
    // Transaction pour assurer l'atomicité
    const transaction = await models.sequelize.transaction();
    
    try {
      // Mettre à jour le statut et la date d'émission
      await this.repository.updateStatus(id, FactureStatut.EMISE, { transaction });
      await this.repository.update(id, {
        dateEmission: new Date(),
        updatedBy: context.userId,
        dateMaj: new Date()
      }, { transaction });
      
      // Générer le PDF
      const pdfPath = await this.generatePDF(id, context.tenantId);
      
      // Mettre à jour le chemin du PDF dans la facture
      await this.repository.update(id, {
        pdfPath,
        updatedBy: context.userId,
        dateMaj: new Date()
      }, { transaction });
      
      // Commit de la transaction
      await transaction.commit();
      
      // Audit trail
      await this.auditService.logAction({
        factureId: id,
        userId: context.userId,
        action: 'EMISSION' as AuditAction,
        details: { pdfPath },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });
      
      // Notifier le client par email avec le PDF généré
      try {
        await this.notifierClient(id, 'FACTURE_EMISE', {
          pdfPath,
          tenantId: context.tenantId,
          userId: context.userId
        });
      } catch (error) {
        console.error('Erreur lors de la notification du client:', error);
        // Ne pas bloquer le processus si la notification échoue
      }
      
      // Récupérer la facture mise à jour
      const factureUpdated = await this.findById(id, context.tenantId);
      return FactureMapper.toResponse(factureUpdated);
    } catch (error) {
      // Rollback en cas d'erreur
      await transaction.rollback();
      console.error('Erreur lors de l\'émission de la facture:', error);
      throw new Error(`Erreur lors de l'émission de la facture: ${error.message}`);
    }
  }

  /**
   * Annule une facture
   */
  async annulerFacture(id: string, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    motifAnnulation?: string;
  }): Promise<any> {
    const facture = await this.findById(id, context.tenantId);
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    if (facture.statut === FactureStatut.PAYEE) {
      throw new Error('Une facture payée ne peut pas être annulée');
    }
    
    if (facture.statut === FactureStatut.ANNULEE) {
      throw new Error('Cette facture est déjà annulée');
    }
    
    // Transaction pour assurer l'atomicité
    const transaction = await models.sequelize.transaction();
    
    try {
      // Mettre à jour le statut
      await this.repository.updateStatus(id, FactureStatut.ANNULEE, { transaction });
      await this.repository.update(id, {
        commentaire: `${facture.commentaire || ''} [ANNULÉE: ${context.motifAnnulation || 'Aucun motif spécifié'}]`.trim(),
        updatedBy: context.userId,
        dateMaj: new Date()
      }, { transaction });
      
      // Commit de la transaction
      await transaction.commit();
      
      // Audit trail
      await this.auditService.logAction({
        factureId: id,
        userId: context.userId,
        action: 'ANNULATION' as AuditAction,
        details: { motif: context.motifAnnulation },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });
      
      // Récupérer la facture mise à jour
      const factureUpdated = await this.findById(id, context.tenantId);
      return FactureMapper.toResponse(factureUpdated);
    } catch (error) {
      // Rollback en cas d'erreur
      await transaction.rollback();
      console.error('Erreur lors de l\'annulation de la facture:', error);
      throw new Error(`Erreur lors de l'annulation de la facture: ${error.message}`);
    }
  }

  /**
   * Génère un PDF pour une facture
   */
  private async generatePDF(factureId: string, tenantId: string): Promise<string> {
    // Récupérer la facture complète
    const facture = await this.findById(factureId, tenantId);
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    try {
      // Utiliser notre nouveau service de génération PDF
      const context = {
        tenantId,
        userId: 'system', // Une valeur par défaut si le processus est automatique
      };
      
      // Générer le PDF en utilisant notre service dédié
      const pdfPath = await this.pdfGeneratorService.generateFacturePdf(facture, context);
      
      // Audit trail
      await this.auditService.logAction({
        factureId: factureId,
        action: 'GENERATION_PDF' as AuditAction,
        details: { success: true, pdfPath },
        tenantId: tenantId
      });
      
      // Retourner le chemin vers le fichier PDF généré
      return pdfPath;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Audit de l'échec
      await this.auditService.logAction({
        factureId: factureId,
        action: 'GENERATION_PDF' as AuditAction,
        details: { success: false, error: error.message },
        tenantId: tenantId
      });
      
      throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }
  
  /**
   * Notifie le client par email
   */
  private async notifierClient(factureId: string, eventType: string, data: any = {}): Promise<void> {
    const facture = await this.findById(factureId, data.tenantId);
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    try {
      // Récupérer les infos client
      let clientInfo = {};
      if (facture.clientId) {
        try {
          clientInfo = await this.interServiceService.getClientInfo(facture.clientId);
        } catch (error) {
          console.error('Erreur lors de la récupération des infos client:', error);
        }
      }
      
      // Récupérer les infos contrat
      let contratInfo = {};
      if (facture.contratId) {
        try {
          contratInfo = await this.interServiceService.getContratById(facture.contratId);
        } catch (error) {
          console.error('Erreur lors de la récupération des infos contrat:', error);
        }
      }
      
      // Associer le type d'événement interne au type d'événement du mailer service
      let mailerEventType;
      switch (eventType) {
        case 'FACTURE_EMISE':
          mailerEventType = 'facture.emitted';
          // Générer le PDF lors de l'émission pour joindre au mail
          if (!data.pdfPath) {
            try {
              data.pdfPath = await this.generatePDF(factureId, data.tenantId);
            } catch (error) {
              console.error('Erreur lors de la génération du PDF pour l\'email:', error);
            }
          }
          break;
        case 'FACTURE_PAIEMENT':
          mailerEventType = 'facture.payment.registered';
          break;
        case 'FACTURE_RELANCE':
          mailerEventType = 'facture.payment.reminder';
          break;
        default:
          mailerEventType = eventType;
      }
      
      // Émettre l'événement au service mailer
      await this.interServiceService.emitEvent(mailerEventType, {
        facture: FactureMapper.toResponse(facture),
        client: clientInfo,
        contrat: contratInfo,
        ...data
      });
      
      // Journaliser l'envoi de la notification
      await this.auditService.logAction({
        factureId: factureId,
        action: `NOTIFICATION_${eventType}` as AuditAction,
        details: { success: true, eventType: mailerEventType },
        tenantId: data.tenantId,
        userId: data.userId
      });
      
      console.log(`Notification "${mailerEventType}" envoyée au client pour la facture ${factureId}`);
    } catch (error) {
      console.error('Erreur lors de la notification du client:', error);
      
      // Journaliser l'échec de la notification
      await this.auditService.logAction({
        factureId: factureId,
        action: `NOTIFICATION_${eventType}` as AuditAction,
        details: { success: false, error: error.message },
        tenantId: data.tenantId,
        userId: data.userId
      });
      
      throw new Error(`Erreur lors de la notification du client: ${error.message}`);
    }
  }

  /**
   * Enregistre un paiement pour une facture
   */
  async enregistrerPaiement(factureId: string, paiementDto: any, context: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    const facture = await this.findById(factureId, context.tenantId);
    
    if (!facture) {
      throw new Error('Facture non trouvée');
    }
    
    if (facture.statut === FactureStatut.ANNULEE) {
      throw new Error('Impossible d\'enregistrer un paiement pour une facture annulée');
    }
    
    // Transaction pour assurer l'atomicité
    const transaction = await models.sequelize.transaction();
    
    try {
      // Créer le paiement
      const now = new Date();
      const paiementData = this.multiTenantService.addTenantToData({
        id: uuidv4(),
        factureId,
        clientId: facture.clientId,
        ...paiementDto,
        dateCreation: now,
        createdBy: context.userId,
        updatedBy: context.userId,
        dateMaj: now
      }, context.tenantId);
      
      const paiement = await this.paiementRepository.create(paiementData, { transaction });
      
      // Calculer le total des paiements
      const totalPaiements = await this.paiementRepository.getTotalPaidForInvoice(factureId, { transaction });
      const montantRestant = facture.montantTTC - totalPaiements;
      let nouveauStatut: FactureStatut = facture.statut;
      
      // Mettre à jour le statut de la facture si entièrement payée
      if (totalPaiements >= facture.montantTTC) {
        nouveauStatut = FactureStatut.PAYEE;
        await this.repository.updateStatus(factureId, FactureStatut.PAYEE, { transaction });
        await this.repository.update(factureId, {
          datePaiement: now,
          updatedBy: context.userId,
          dateMaj: now
        }, { transaction });
      } else if (totalPaiements > 0) {
        // Partiellement payée
        nouveauStatut = FactureStatut.PARTIELLEMENT_PAYEE;
        await this.repository.updateStatus(factureId, FactureStatut.PARTIELLEMENT_PAYEE, { transaction });
        await this.repository.update(factureId, {
          updatedBy: context.userId,
          dateMaj: now
        }, { transaction });
      }
      
      // Commit de la transaction
      await transaction.commit();
      
      // Vérifier/générer le PDF si nécessaire
      let pdfPath = facture.pdfPath;
      if (!pdfPath) {
        try {
          pdfPath = await this.generatePDF(factureId, context.tenantId);
          
          // Mettre à jour le chemin du PDF dans la facture
          await this.repository.update(factureId, {
            pdfPath,
            updatedBy: context.userId,
            dateMaj: now
          });
        } catch (error) {
          console.error('Erreur lors de la génération du PDF pour le paiement:', error);
          // Continuer malgré l'erreur de génération du PDF
        }
      }
      
      // Audit trail
      await this.auditService.logAction({
        factureId,
        userId: context.userId,
        action: 'PAIEMENT' as AuditAction,
        details: { 
          paiementId: paiement.id,
          montant: paiement.montant,
          montantRestant,
          nouveauStatut,
          typePaiement: paiement.typePaiement,
          reference: paiement.reference
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });
      
      // Notifier le client par email
      try {
        // Récupérer tous les paiements pour la facture pour le détail du mail
        const tousLesPaiements = await this.paiementRepository.findByFactureId(factureId);
        
        await this.notifierClient(factureId, 'FACTURE_PAIEMENT', {
          paiement,
          paiements: tousLesPaiements,
          montantTotal: facture.montantTTC,
          montantPaye: totalPaiements,
          montantRestant,
          nouveauStatut,
          pdfPath,
          tenantId: context.tenantId,
          userId: context.userId
        });
      } catch (error) {
        console.error('Erreur lors de la notification du client:', error);
        // Ne pas bloquer le processus si la notification échoue
      }
      
      // Récupérer la facture mise à jour
      const factureUpdated = await this.findById(factureId, context.tenantId);
      return FactureMapper.toResponse(factureUpdated);
    } catch (error) {
      // Rollback en cas d'erreur
      await transaction.rollback();
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw new Error(`Erreur lors de l'enregistrement du paiement: ${error.message}`);
    }
  }

  /**
   * Récupère les factures par contrat
   */
  async findByContratId(contratId: string, tenantId: string): Promise<any[]> {
    const factures = await this.repository.find({
      where: { contratId }
    });
    
    if (!factures) {
      return [];
    }
    
    // Filtrer par tenant
    const filteredFactures = this.multiTenantService.filterByTenant(factures, tenantId);
    
    return FactureMapper.toResponseList(filteredFactures);
  }
  
  /**
   * Récupère les factures par client
   */
  async findByClientId(clientId: string, tenantId: string): Promise<any[]> {
    const factures = await this.repository.find({
      where: { clientId }
    });
    
    if (!factures) {
      return [];
    }
    
    // Filtrer par tenant
    const filteredFactures = this.multiTenantService.filterByTenant(factures, tenantId);
    
    return FactureMapper.toResponseList(filteredFactures);
  }
  
  /**
   * Récupère les factures impayées
   */
  async findUnpaid(tenantId: string): Promise<any[]> {
    try {
      // Utiliser la nouvelle méthode findUnpaidSimple qui évite les problèmes d'associations
      const factures = await this.repository.findUnpaidSimple({
        // Ajouter le filtre tenantId si présent
        where: tenantId ? { statut: 'IMPAYEE', tenantId } : { statut: 'IMPAYEE' }
      });
      
      if (!factures || factures.length === 0) {
        return [];
      }
      
      // Transformer les modèles Sequelize en objets simples pour le frontend
      return FactureMapper.toResponseList(factures);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures impayées:', error);
      return [];
    }
  }
  
  /**
   * Relance les clients pour les factures impayées
   */
  async relancerFacturesImpayees(options: {
    joursDepuisEmission: number;
    tenantId: string;
    userId?: string;
  }): Promise<{
    nbRelances: number;
    facturesRelancees: string[];
  }> {
    // Trouver les factures impayées
    const facturesImpayees = await this.findUnpaid(options.tenantId);
    
    // Filtrer les factures qui dépassent le délai spécifié
    const now = new Date();
    const facturesARelancer = facturesImpayees.filter(facture => {
      const dateEmission = new Date(facture.dateEmission);
      const joursDiff = Math.floor((now.getTime() - dateEmission.getTime()) / (1000 * 60 * 60 * 24));
      return joursDiff >= options.joursDepuisEmission;
    });
    
    const facturesRelancees: string[] = [];
    
    // Relancer chaque facture
    for (const facture of facturesARelancer) {
      try {
        // Récupérer l'historique des relances pour déterminer le numéro de relance actuel
        const relancesPassees = await this.auditService.findActions({
          factureId: facture.id,
          action: 'RELANCE',
          tenantId: options.tenantId
        });
        
        // Déterminer le numéro de relance (1, 2, 3...)
        const relanceNumber = relancesPassees.length + 1;
        const joursRetard = Math.floor((now.getTime() - new Date(facture.dateEcheance).getTime()) / (1000 * 60 * 60 * 24));
        
        // Récupérer les paiements associés à cette facture
        const paiements = await this.paiementRepository.findByFactureId(facture.id);
        const montantPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
        const montantRestant = facture.montantTTC - montantPaye;
        
        // Générer le PDF de la facture si ce n'est pas déjà fait
        let pdfPath = facture.pdfPath;
        if (!pdfPath) {
          try {
            pdfPath = await this.generatePDF(facture.id, options.tenantId);
            
            // Mettre à jour le chemin du PDF dans la facture
            await this.repository.update(facture.id, {
              pdfPath,
              updatedBy: options.userId,
              dateMaj: now
            });
          } catch (error) {
            console.error(`Erreur lors de la génération du PDF pour la relance ${facture.id}:`, error);
            // Continuer malgré l'erreur
          }
        }
        
        // Notifier le client par email
        await this.notifierClient(facture.id, 'FACTURE_RELANCE', {
          joursRetard,
          relanceNumber,
          montantPaye,
          montantRestant,
          pdfPath,
          tenantId: options.tenantId,
          userId: options.userId
        });
        
        // Mettre à jour le nombre de relances de la facture
        await this.repository.update(facture.id, {
          nbRelances: relanceNumber,
          dateDerniereRelance: now,
          updatedBy: options.userId,
          dateMaj: now
        });
        
        // Audit trail
        await this.auditService.logAction({
          factureId: facture.id,
          userId: options.userId,
          action: 'RELANCE' as AuditAction,
          details: { 
            joursDepuisEmission: options.joursDepuisEmission,
            joursRetard,
            relanceNumber,
            montantPaye,
            montantRestant 
          },
          tenantId: options.tenantId
        });
        
        facturesRelancees.push(facture.id);
      } catch (error) {
        console.error(`Erreur lors de la relance de la facture ${facture.id}:`, error);
        // Continuer avec la facture suivante
      }
    }
    
    return {
      nbRelances: facturesRelancees.length,
      facturesRelancees
    };
  }

  /**
   * Génère un PDF pour une facture et met à jour la facture avec le chemin du PDF
   * Méthode publique pour être utilisée depuis le contrôleur
   */
  async generatePDFForInvoice(factureId: string, context: { 
    tenantId: string;
    userId?: string; 
  }): Promise<string> {
    const pdfPath = await this.generatePDF(factureId, context.tenantId);
    
    // Mettre à jour le chemin du PDF dans la facture
    await this.repository.update(factureId, {
      pdfPath,
      updatedBy: context.userId,
      dateMaj: new Date()
    });
    
    return pdfPath;
  }

  /**
   * Envoie manuellement une notification par email concernant une facture
   */
  async envoyerNotificationManuelle(factureId: string, type: string, data: {
    tenantId: string;
    userId?: string;
    pdfPath?: string;
    [key: string]: any;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier que la facture existe
      const facture = await this.findById(factureId, data.tenantId);
      if (!facture) {
        throw new Error('Facture non trouvée');
      }
      
      // Pour les notifications de paiement, récupérer les paiements associés
      if (type === 'FACTURE_PAIEMENT') {
        const paiements = await this.paiementRepository.findByFactureId(factureId);
        if (paiements.length === 0) {
          throw new Error('Cette facture n\'a aucun paiement enregistré');
        }
        
        // Calculer les totaux pour le contexte
        const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0);
        const montantRestant = facture.montantTTC - totalPaiements;
        
        // Ajouter au contexte de notification
        data.paiements = paiements;
        data.paiement = paiements[paiements.length - 1]; // Dernier paiement
        data.montantTotal = facture.montantTTC;
        data.montantPaye = totalPaiements;
        data.montantRestant = montantRestant;
      }
      
      // Pour les notifications de relance, ajouter le contexte supplémentaire
      if (type === 'FACTURE_RELANCE') {
        const now = new Date();
        const joursRetard = Math.floor((now.getTime() - new Date(facture.dateEcheance).getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculer le nombre de relances passées
        const relancesPassees = await this.auditService.findActions({
          factureId: factureId,
          action: 'RELANCE',
          tenantId: data.tenantId
        });
        
        // Ajouter au contexte de notification
        data.joursRetard = joursRetard;
        data.relanceNumber = relancesPassees.length + 1;
      }
      
      // Envoyer la notification via notre méthode notifierClient
      await this.notifierClient(factureId, type, data);
      
      // Audit de l'action
      await this.auditService.logAction({
        factureId: factureId,
        userId: data.userId,
        action: `NOTIFICATION_MANUELLE_${type}` as AuditAction,
        details: { 
          success: true,
          type,
          pdfPath: data.pdfPath
        },
        tenantId: data.tenantId
      });
      
      return {
        success: true,
        message: `Notification de type ${type} envoyée avec succès.`
      };
    } catch (error) {
      console.error(`Erreur lors de l'envoi manuel d'une notification (${type}):`, error);
      
      // Audit de l'échec
      await this.auditService.logAction({
        factureId: factureId,
        userId: data.userId,
        action: `NOTIFICATION_MANUELLE_${type}` as AuditAction,
        details: { 
          success: false,
          type,
          error: error.message
        },
        tenantId: data.tenantId
      });
      
      throw new Error(`Erreur lors de l'envoi de la notification: ${error.message}`);
    }
  }

  /**
   * Recherche des factures par période
   */
  async findByPeriode(debut: Date | string, fin: Date | string, tenantId: string) {
    const debutDate = typeof debut === 'string' ? new Date(debut) : debut;
    const finDate = typeof fin === 'string' ? new Date(fin) : fin;
    
    // Utiliser find pour chercher les factures entre les deux dates
    const factures = await this.repository.find({
      where: {
        tenantId,
        dateEmission: {
          $gte: debutDate,
          $lte: finDate
        }
      }
    });
    
    // Mapper les résultats
    return factures.map(facture => {
      // Convertir l'entité en objet simple
      const mapped = { 
        ...facture, 
        dateEmission: facture.dateEmission instanceof Date ? facture.dateEmission.toISOString() : facture.dateEmission,
        dateEcheance: facture.dateEcheance instanceof Date ? facture.dateEcheance.toISOString() : facture.dateEcheance
      };
      return mapped;
    });
  }
}
