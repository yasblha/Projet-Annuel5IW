import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité ContratCompteurHistorique (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class ContratCompteurHistoriqueRepository {
  private readonly repo = models.ContratCompteurHistorique;

  /**
   * Récupère l'historique des compteurs liés à un contrat
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
        { model: models.Compteur, as: 'compteur' }
      ]
    });
  }

  /**
   * Récupère l'historique d'un compteur spécifique
   */
  async findByCompteurId(
    compteurId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { compteurId },
      transaction: options.transaction,
      order: [['dateDebut', 'DESC']],
      include: [
        { model: models.Contrat, as: 'contrat' }
      ]
    });
  }

  /**
   * Récupère le compteur actuel d'un contrat
   */
  async findCurrentMeterForContract(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findOne({
      where: { 
        contratId,
        dateFin: null
      },
      transaction: options.transaction,
      include: [
        { model: models.Compteur, as: 'compteur' }
      ]
    });
  }

  /**
   * Termine l'association active entre un contrat et un compteur
   */
  async endCurrentAssociation(
    contratId: string,
    options: { 
      transaction?: Transaction,
      dateFin?: Date,
      raisonFin?: string 
    } = {}
  ) {
    const dateFin = options.dateFin || new Date();
    
    return this.repo.update(
      { 
        dateFin, 
        raisonFin: options.raisonFin || 'REMPLACEMENT',
        dateMaj: new Date() 
      },
      { 
        where: { 
          contratId,
          dateFin: null
        },
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
        { model: models.Compteur, as: 'compteur' },
        { model: models.Contrat, as: 'contrat' }
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
