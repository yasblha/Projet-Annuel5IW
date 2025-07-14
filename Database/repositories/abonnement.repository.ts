import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Abonnement (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class AbonnementRepository {
  private readonly repo = models.Abonnement;

  /**
   * Récupère les abonnements liés à un contrat
   */
  async findByContratId(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { contratId },
      transaction: options.transaction,
      order: [['dateDebut', 'DESC']],
      include: [
        { model: models.Tarif, as: 'tarif' }
      ]
    });
  }

  /**
   * Récupère l'abonnement actif pour un contrat donné
   */
  async findActiveByContratId(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findOne({
      where: { 
        contratId,
        statut: 'ACTIF'
      },
      transaction: options.transaction,
      include: [
        { model: models.Tarif, as: 'tarif' }
      ]
    });
  }

  /**
   * Met à jour le statut d'un abonnement
   */
  async updateStatus(
    abonnementId: string,
    statut: 'ACTIF' | 'SUSPENDU' | 'TERMINE',
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      { statut, dateMaj: new Date() },
      { 
        where: { id: abonnementId },
        transaction: options.transaction
      }
    );
  }

  // --- Méthodes CRUD minimales ---
  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async findById(id: string, options: { transaction?: Transaction } = {}) {
    return this.repo.findByPk(id, { 
      transaction: options.transaction,
      include: [
        { model: models.Tarif, as: 'tarif' }
      ]
    });
  }

  async findAll(filter: any = {}, options: { transaction?: Transaction } = {}) {
    return this.repo.findAll({
      where: filter,
      transaction: options.transaction,
      order: [['dateDebut', 'DESC']],
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
