import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité Facture (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class FactureRepository {
  private readonly repo = models.Facture;

  /**
   * Récupère les factures liées à un contrat
   */
  async findByContratId(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { contratId },
      transaction: options.transaction,
      order: [['dateEmission', 'DESC']],
      include: [
        { model: models.LigneFacture, as: 'lignes' },
        { model: models.Paiement, as: 'paiements' }
      ]
    });
  }

  /**
   * Récupère les factures liées à un client
   */
  async findByClientId(
    clientId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { clientId },
      transaction: options.transaction,
      order: [['dateEmission', 'DESC']],
      include: [
        { model: models.LigneFacture, as: 'lignes' }
      ]
    });
  }

  /**
   * Récupère les factures impayées
   */
  async findUnpaid(
    options: { transaction?: Transaction, clientId?: string } = {}
  ) {
    const where: any = { 
      statut: 'IMPAYEE'
    };
    
    if (options.clientId) {
      where.clientId = options.clientId;
    }
    
    return this.repo.findAll({
      where,
      transaction: options.transaction,
      order: [['dateEcheance', 'ASC']],
      include: [
        { model: models.LigneFacture, as: 'lignes' }
      ]
    });
  }

  /**
   * Met à jour le statut d'une facture
   */
  async updateStatus(
    factureId: string,
    statut: 'BROUILLON' | 'EMISE' | 'PAYEE' | 'IMPAYEE' | 'ANNULEE',
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      { statut, dateMaj: new Date() },
      { 
        where: { id: factureId },
        transaction: options.transaction
      }
    );
  }

  // --- Méthodes CRUD minimales ---
  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async findById(id: string, options: { transaction?: Transaction, inclusions?: boolean } = {}) {
    const include = options.inclusions ? [
      { model: models.LigneFacture, as: 'lignes' },
      { model: models.Paiement, as: 'paiements' }
    ] : [];
    
    return this.repo.findByPk(id, { 
      transaction: options.transaction,
      include
    });
  }

  async findAll(filter: any = {}, options: { transaction?: Transaction } = {}) {
    return this.repo.findAll({
      where: filter,
      transaction: options.transaction,
      order: [['dateEmission', 'DESC']],
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
