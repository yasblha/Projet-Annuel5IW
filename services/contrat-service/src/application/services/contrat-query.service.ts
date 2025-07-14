import { Injectable } from '@nestjs/common';
import { ContratRepository } from '@infrastructure/repositories/contrat.repository';
import { ContratMapper } from '../mappers/contrat.mapper';
import { CosignataireRepository } from '@infrastructure/repositories/cosignataire.repository';
import { ContratAuditRepository } from '@Database/repositories/contrat.repository';
import { ContratContext } from './contrat.service';
import { AuditService } from './audit.service';

/**
 * Service de requête pour les opérations de lecture des contrats
 * Implémente le pattern CQRS pour séparer les opérations de lecture et d'écriture
 */
@Injectable()
export class ContratQueryService {
  constructor(
    private readonly repository: ContratRepository,
    private readonly cosignataireRepository: CosignataireRepository,
    private readonly auditRepository: ContratAuditRepository,
    private readonly auditService: AuditService
  ) {}

  /**
   * Récupère tous les contrats avec pagination et filtres optionnels
   * @param params Paramètres de recherche et filtres
   * @returns Liste paginée des contrats
   */
  async findAll(params: {
    search?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
    proprietaireId?: string;
    tenantId: string; // tenantId est obligatoire pour le repository
    page?: number;
    limit?: number;
  }) {
    return this.repository.searchContrats(params);
  }

  /**
   * Récupère un contrat par son ID
   * @param id Identifiant du contrat
   * @param context Contexte d'exécution
   * @returns Contrat trouvé
   */
  async findById(id: string, context: ContratContext) {
    const contrat = await this.repository.findById(id, context.tenantId);
    if (!contrat) throw new Error('Contrat non trouvé');

    return ContratMapper.toResponse(contrat);
  }

  /**
   * Récupère les cosignataires d'un contrat
   * @param contratId Identifiant du contrat
   * @param context Contexte d'exécution (peut être un objet ContratContext ou un simple tenantId)
   * @returns Liste des cosignataires
   */
  async getCosignatairesByContrat(contratId: string, context: ContratContext | string) {
    const tenantId = typeof context === 'string' ? context : context.tenantId;
    return this.cosignataireRepository.findAllByContrat(contratId, tenantId);
  }

  /**
   * Récupère l'historique d'audit d'un contrat
   * @param contratId Identifiant du contrat
   * @param context Contexte d'exécution
   * @param options Options de pagination
   * @returns Historique d'audit
   */
  async getAuditTrail(contratId: string, context: ContratContext, options?: { limit?: number; page?: number }) {
    // La méthode auditRepository.findByContratId attend le contratId et tenantId comme paramètres distincts
    const mergedOptions = {
      limit: options?.limit || 50,
      page: options?.page || 1,
      action: undefined,
      dateDebut: undefined,
      dateFin: undefined
    };
    
    // On utilise le tenantId du context directement comme second paramètre
    return this.auditService.getAuditTrail(contratId, mergedOptions);
  }

  /**
   * Récupère l'historique des compteurs d'un contrat
   * @param contratId Identifiant du contrat
   * @param context Contexte d'exécution
   * @returns Historique des compteurs
   */
  async getCompteurHistorique(contratId: string, context: ContratContext) {
    return this.repository.getCompteurHistorique(contratId, context.tenantId);
  }

  /**
   * Recherche des contrats selon différents critères
   * @param params Paramètres de recherche
   * @returns Résultats de recherche paginés
   */
  async searchContrats(params: {
    search?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
    proprietaireId?: string;
    tenantId: string;  // tenantId est obligatoire pour le repository
    page?: number;
    limit?: number;
  }) {
    return this.repository.searchContrats(params);
  }

  /**
   * Récupère des statistiques sur les contrats
   * @param context Contexte d'exécution
   * @returns Statistiques sur les contrats
   */
  async getContratStats(context: ContratContext) {
    return this.repository.getContratStats(context.tenantId);
  }
}
