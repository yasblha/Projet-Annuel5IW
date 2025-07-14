import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité LigneFacture (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class LigneFactureRepository {
  private readonly repo = models.LigneFacture;

  /**
   * Récupère les lignes d'une facture
   */
  async findByFactureId(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { factureId },
      transaction: options.transaction,
      order: [['ordre', 'ASC']],
    });
  }

  /**
   * Calcule le montant total des lignes d'une facture
   */
  async getTotalForInvoice(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ): Promise<number> {
    const result = await this.repo.sum('montant', {
      where: { factureId },
      transaction: options.transaction
    });
    
    return result || 0;
  }

  /**
   * Regroupe les lignes par type
   */
  async groupByType(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { factureId },
      attributes: [
        'type',
        [models.sequelize.fn('SUM', models.sequelize.col('montant')), 'total']
      ],
      group: ['type'],
      transaction: options.transaction,
      raw: true
    });
  }

  // --- Méthodes CRUD minimales ---
  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async bulkCreate(data: any[], options: { transaction?: Transaction } = {}) {
    return this.repo.bulkCreate(data, { transaction: options.transaction });
  }

  async findById(id: string, options: { transaction?: Transaction } = {}) {
    return this.repo.findByPk(id, { transaction: options.transaction });
  }

  async findAll(filter: any = {}, options: { transaction?: Transaction } = {}) {
    return this.repo.findAll({
      where: filter,
      transaction: options.transaction,
      order: [['ordre', 'ASC']],
    });
  }

  async update(id: string, data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.update(
      data,
      { 
        where: { id },
        transaction: options.transaction
      }
    );
  }

  async deleteByFactureId(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.destroy({
      where: { factureId },
      transaction: options.transaction
    });
  }
}
