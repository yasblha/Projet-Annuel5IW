import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité ContratCosignataire (couche Database).
 * Il n'a aucune dépendance à Nest ; il peut être utilisé dans n'importe quel service.
 */
export class ContratCosignaireRepository {
  private readonly repo = models.ContractCosigner;

  /**
   * Récupère tous les cosignataires d'un contrat
   */
  async findByContratId(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { contratId },
      transaction: options.transaction,
      order: [['dateCreation', 'ASC']],
    });
  }

  /**
   * Récupère les cosignataires qui n'ont pas encore signé
   */
  async findPendingSignatures(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.findAll({
      where: { 
        contratId,
        statutSignature: 'EN_ATTENTE'
      },
      transaction: options.transaction,
    });
  }

  /**
   * Met à jour le statut d'invitation d'un cosignataire
   */
  async updateInvitationStatus(
    id: string,
    statutInvitation: 'NON_ENVOYE' | 'ENVOYE' | 'ERREUR',
    options: { transaction?: Transaction } = {}
  ) {
    return this.repo.update(
      { 
        statutInvitation, 
        dateInvitation: statutInvitation === 'ENVOYE' ? new Date() : null,
        dateMaj: new Date() 
      },
      { 
        where: { id },
        transaction: options.transaction
      }
    );
  }

  /**
   * Met à jour le statut de signature d'un cosignataire
   */
  async updateSignatureStatus(
    id: string,
    statutSignature: 'EN_ATTENTE' | 'SIGNE' | 'REFUSE',
    options: { transaction?: Transaction, signatureData?: string } = {}
  ) {
    const updateData: any = {
      statutSignature,
      dateMaj: new Date()
    };
    
    if (statutSignature !== 'EN_ATTENTE') {
      updateData.dateSignature = new Date();
    }
    
    if (options.signatureData && statutSignature === 'SIGNE') {
      updateData.signatureData = options.signatureData;
    }
    
    return this.repo.update(
      updateData,
      { 
        where: { id },
        transaction: options.transaction
      }
    );
  }

  /**
   * Vérifie si tous les cosignataires ont signé
   */
  async areAllSigned(
    contratId: string,
    options: { transaction?: Transaction } = {}
  ): Promise<boolean> {
    const count = await this.repo.count({
      where: { 
        contratId,
        statutSignature: { $ne: 'SIGNE' }
      },
      transaction: options.transaction
    });
    
    return count === 0;
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
