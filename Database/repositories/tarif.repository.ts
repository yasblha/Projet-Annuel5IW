import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Tarif (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class TarifRepository {
  private readonly repo = models.Tarif;

  /**
   * Récupère les tarifs actifs
   */
  async findActive(
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { actif: true },
      transaction: options.transaction,
      order: [['prixBase', 'ASC']],
    });
  }

  /**
   * Récupère les tarifs par type (ex: STANDARD, PREMIUM)
   */
  async findByType(
    type: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { 
        type,
        actif: true 
      },
      transaction: options.transaction,
      order: [['prixBase', 'ASC']],
    });
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
      order: [['prixBase', 'ASC']],
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
