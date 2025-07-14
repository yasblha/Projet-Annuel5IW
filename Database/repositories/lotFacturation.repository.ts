import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité LotFacturation (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class LotFacturationRepository {
  private readonly repo = models.LotFacturation;

  /**
   * Récupère les lots de facturation en cours de traitement
   */
  async findProcessing(
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { 
        statut: 'EN_COURS' 
      },
      transaction: options.transaction,
      order: [['dateCreation', 'ASC']],
    });
  }

  /**
   * Récupère les lots de facturation par période
   */
  async findByPeriod(
    mois: number,
    annee: number,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { 
        mois,
        annee
      },
      transaction: options.transaction,
      order: [['dateCreation', 'DESC']],
    });
  }

  /**
   * Met à jour le statut d'un lot de facturation
   */
  async updateStatus(
    lotId: string,
    statut: 'EN_COURS' | 'TERMINE' | 'ERREUR',
    options: { transaction?: Transaction, erreur?: string } = {}
  ) {
    const updateData: any = {
      statut,
      dateMaj: new Date()
    };
    
    if (statut === 'TERMINE') {
      updateData.dateFinTraitement = new Date();
    }
    
    if (options.erreur && statut === 'ERREUR') {
      updateData.messageErreur = options.erreur;
    }
    
    return this.repo.update(
      updateData,
      { 
        where: { id: lotId },
        transaction: options.transaction
      }
    );
  }

  /**
   * Met à jour les statistiques d'un lot de facturation
   */
  async updateStats(
    lotId: string,
    stats: { 
      nbFacturesTotal: number, 
      nbFacturesTraitees: number,
      nbFacturesErreur: number,
      montantTotal: number
    },
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      {
        ...stats,
        dateMaj: new Date()
      },
      { 
        where: { id: lotId },
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
    return this.repo.findAll({
      where: filter,
      transaction: options.transaction,
      order: [['dateCreation', 'DESC']],
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
