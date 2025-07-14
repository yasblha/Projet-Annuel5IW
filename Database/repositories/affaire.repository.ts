import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Affaire (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class AffaireRepository {
  private readonly repo = models.Affaire;

  /**
   * Récupère les affaires d'un client
   */
  async findByClientId(
    clientId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { clientId },
      transaction: options.transaction,
      order: [['dateCreation', 'DESC']],
    });
  }

  /**
   * Récupère les affaires en cours (non clôturées)
   */
  async findOpen(
    options: { transaction?: Transaction, clientId?: string } = {}
  ) {
    const where: any = { 
      statut: { $ne: 'CLOTUREE' }
    };
    
    if (options.clientId) {
      where.clientId = options.clientId;
    }
    
    return this.repo.findAll({
      where,
      transaction: options.transaction,
      order: [['dateCreation', 'DESC']],
    });
  }

  /**
   * Met à jour le statut d'une affaire
   */
  async updateStatus(
    affaireId: string,
    statut: 'OUVERTE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE' | 'CLOTUREE',
    options: { transaction?: Transaction, commentaire?: string } = {}
  ) {
    const updateData: any = { 
      statut, 
      dateMaj: new Date() 
    };
    
    if (options.commentaire) {
      updateData.commentaire = options.commentaire;
    }
    
    return this.repo.update(
      updateData,
      { 
        where: { id: affaireId },
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
