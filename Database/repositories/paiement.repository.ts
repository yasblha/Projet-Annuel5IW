import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Paiement (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class PaiementRepository {
  private readonly repo = models.Paiement;

  /**
   * Récupère les paiements liés à une facture
   */
  async findByFactureId(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { factureId },
      transaction: options.transaction,
      order: [['dateOperation', 'DESC']],
    });
  }

  /**
   * Récupère les paiements liés à un client
   */
  async findByClientId(
    clientId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { clientId },
      transaction: options.transaction,
      order: [['dateOperation', 'DESC']],
    });
  }

  /**
   * Calcule le montant total des paiements pour une facture
   */
  async getTotalPaidForInvoice(
    factureId: string,
    options: { transaction?: Transaction } = {}
  ): Promise<number> {
    const result = await this.repo.sum('montant', {
      where: { 
        factureId,
        statut: 'VALIDE'
      },
      transaction: options.transaction
    });
    
    return result || 0;
  }

  /**
   * Met à jour le statut d'un paiement
   */
  async updateStatus(
    paiementId: string,
    statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ANNULE',
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      { statut, dateMaj: new Date() },
      { 
        where: { id: paiementId },
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
      order: [['dateOperation', 'DESC']],
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
