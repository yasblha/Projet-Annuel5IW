import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité ContratAudit (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class ContratAuditRepository {
  private readonly repo = models.ContratAudit;

  /**
   * Récupère l'historique des modifications d'un contrat
   */
  async findByContratId(
    contratId: string,
    options: { transaction?: Transaction, limit?: number } = {}
  ) {
    return this.repo.findAll({
      where: { contratId },
      transaction: options.transaction,
      order: [['dateAction', 'DESC']],
      limit: options.limit || undefined,
      include: [
        { model: models.Utilisateur, as: 'utilisateur', attributes: ['id', 'prenom', 'nom', 'email'] }
      ]
    });
  }

  /**
   * Récupère les actions d'un certain type
   */
  async findByActionType(
    typeAction: string,
    options: { transaction?: Transaction, limit?: number, contratId?: string } = {}
  ) {
    const where: any = { typeAction };
    
    if (options.contratId) {
      where.contratId = options.contratId;
    }
    
    return this.repo.findAll({
      where,
      transaction: options.transaction,
      order: [['dateAction', 'DESC']],
      limit: options.limit || undefined,
      include: [
        { model: models.Utilisateur, as: 'utilisateur', attributes: ['id', 'prenom', 'nom', 'email'] }
      ]
    });
  }

  // --- Méthodes CRUD minimales ---
  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async findById(id: string, options: { transaction?: Transaction } = {}) {
    return this.repo.findByPk(id, { 
      transaction: options.transaction,
      include: [
        { model: models.Utilisateur, as: 'utilisateur', attributes: ['id', 'prenom', 'nom', 'email'] }
      ]
    });
  }

  async findAll(filter: any = {}, options: { transaction?: Transaction, limit?: number } = {}) {
    return this.repo.findAll({
      where: filter,
      transaction: options.transaction,
      order: [['dateAction', 'DESC']],
      limit: options.limit || undefined
    });
  }
}
