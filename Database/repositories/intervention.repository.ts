import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Intervention (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class InterventionRepository {
  private readonly repo = models.Intervention;

  /**
   * Récupère les interventions liées à un contrat
   */
  async findByContratId(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { contratId },
      transaction: options.transaction,
      order: [['datePlanifiee', 'DESC']],
    });
  }

  /**
   * Récupère les interventions liées à un compteur
   */
  async findByCompteurId(
    compteurId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { compteurId },
      transaction: options.transaction,
      order: [['datePlanifiee', 'DESC']],
    });
  }

  /**
   * Récupère les interventions d'installation en attente
   */
  async findPendingInstallations(
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { 
        type: 'INSTALLATION',
        statut: 'PROGRAMMEE'
      },
      transaction: options.transaction,
      order: [['datePlanifiee', 'ASC']],
    });
  }

  /**
   * Met à jour le compteur associé à une intervention d'installation
   */
  async updateCompteur(
    interventionId: string,
    compteurId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      { compteurId, dateMaj: new Date() },
      { 
        where: { id: interventionId },
        transaction: options.transaction
      }
    );
  }

  /**
   * Change le statut d'une intervention
   */
  async updateStatus(
    interventionId: string,
    statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE',
    options: { transaction?: Transaction, utilisateurId?: string } = {}
  ) {
    const updateData: any = { 
      statut, 
      dateMaj: new Date() 
    };
    
    if (statut === 'EN_COURS') {
      updateData.dateDebut = new Date();
    }
    
    if (statut === 'TERMINEE') {
      updateData.dateRealisee = new Date();
    }
    
    if (options.utilisateurId) {
      updateData.updatedBy = options.utilisateurId;
    }
    
    return this.repo.update(
      updateData,
      { 
        where: { id: interventionId },
        transaction: options.transaction
      }
    );
  }

  // --- Méthodes CRUD minimales ---
  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async findById(id: string, options: { transaction?: Transaction } = {}) {
    return this.repo.findByPk(id, { transaction: options.transaction });
  }

  async findAll(filter: any = {}, options: { transaction?: Transaction } = {}) {
    // Retirer les paramètres de pagination qui ne correspondent pas à des colonnes SQL
    const { page, limit, ...rawWhere } = filter || {};

    // Nettoyer les valeurs vides et les clés non pertinentes
    const where: Record<string, any> = {};
    Object.entries(rawWhere).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        where[key] = value;
      }
    });

    // Mapper les statuts front → DB
    if (where.statut) {
      const mapStatus = (s: string) => {
        if (s === 'PLANIFIEE') return 'PROGRAMMEE';
        if (s === 'ANNULEE') return 'TERMINEE';
        return s;
      };
      if (Array.isArray(where.statut)) {
        where.statut = where.statut.map(mapStatus);
      } else {
        where.statut = mapStatus(where.statut);
      }
    }

    return this.repo.findAll({
      where,
      transaction: options.transaction,
      order: [['datePlanifiee', 'DESC']],
    });
  }

  async update(id: string, data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.update(
      { ...data, dateMaj: new Date() },
      { 
        where: { id },
        transaction: options.transaction
      }
    );
  }
}
