import { Op } from 'sequelize';
import { models } from '../sequelize';

export class ContratRepository {
  private get repo() {
    const m = models.Contrat;
    if (!m) {
      throw new Error('Model Contrat not initialized');
    }
    return m;
  }

  async findAll(options?: { offset?: number; limit?: number; where?: any }) {
    return this.repo.findAll(options);
  }

  async findById(id: string) {
    return this.repo.findByPk(id);
  }

  /**
   * Variante tenant-safe de findById
   */
  async findByIdWithTenant(id: string, tenantId?: string) {
    const contrat: any = await this.repo.findByPk(id);
    if (tenantId && contrat && contrat.tenantId !== tenantId) {
      return null;
    }
    return contrat;
  }

  /**
   * Recherche par numéro métier ou brouillon.
   */
  async findByNumero(numero: string, tenantId?: string) {
    const where: any = { numero };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findOne({ where });
  }

  /**
   * Récupère tous les compteurs associés à un contrat (historique complet).
   * Pour l'instant, renvoie un tableau vide si le modèle n'existe pas afin de satisfaire la compilation.
   */
  async getCompteursByContrat(contratId: string, tenantId?: string): Promise<any[]> {
    try {
      const m = models.ContratCompteurHistorique;
      if (!m) return [];
      const where: any = { contratId };
      if (tenantId) where.tenantId = tenantId;
      return m.findAll({ where });
    } catch (_) {
      return [];
    }
  }

  /**
   * Renvoie les cosignataires d'un contrat.
   * Si le modèle est absent, retourne [].
   */
  async getCosignatairesByContrat(contratId: string, tenantId?: string): Promise<any[]> {
    try {
      const m = models.ContratCosignataire;
      if (!m) return [];
      const where: any = { contratId };
      if (tenantId) where.tenantId = tenantId;
      return m.findAll({ where });
    } catch (_) {
      return [];
    }
  }

  async create(data: any) {
    return this.repo.create(data);
  }

  async update(id: string, data: any) {
    return this.repo.update(data, { where: { id } });
  }

  async delete(id: string) {
    return this.repo.destroy({ where: { id } });
  }

  async activate(id: string, numero: string, options: { transaction?: any } = {}) {
    await this.repo.update(
      { statut: 'ACTIF', numero },
      { where: { id }, ...options }
    );
    return this.repo.findByPk(id);
  }
}

// CRUD complet pour les cosignataires
const ContractCosignerModel = require('../models/contratCosignataire.model').default(require('../sequelize').sequelize);

export class CosignataireRepository {
  async create(data: any) {
    return ContractCosignerModel.create(data);
  }
  async findById(id: string) {
    return ContractCosignerModel.findByPk(id);
  }
  async findAllByContrat(contratId: string) {
    return ContractCosignerModel.findAll({ where: { contratId } });
  }
  async update(id: string, data: any) {
    const cosignataire = await ContractCosignerModel.findByPk(id);
    if (!cosignataire) return null;
    return cosignataire.update(data);
  }
  async delete(id: string) {
    const cosignataire = await ContractCosignerModel.findByPk(id);
    if (!cosignataire) return null;
    await cosignataire.destroy();
    return true;
  }

  /**
   * Vérifie si tous les cosignataires d'un contrat ont signé.
   * @param contratId Identifiant du contrat.
   * @param options Options Sequelize, par ex. { transaction }
   * @returns true si tous les cosignataires ont la colonne signatureElectronique à true
   */
  async allCosignatairesSigned(contratId: string, options: { transaction?: any } = {}): Promise<boolean> {
    const unsignedCount = await ContractCosignerModel.count({
      where: { contratId, signatureElectronique: false },
      ...options
    });
    return unsignedCount === 0;
  }
}

// CRUD pour l'audit des contrats
const ContratAuditModel = require('../models/contratAudit.model').default(require('../sequelize').sequelize);

export class ContratAuditRepository {
  async create(data: any) {
    return ContratAuditModel.create(data);
  }

  async findAll(options?: { 
    where?: any; 
    order?: any[]; 
    offset?: number; 
    limit?: number;
    include?: any[];
  }) {
    return ContratAuditModel.findAll(options);
  }

  async findById(id: string) {
    return ContratAuditModel.findByPk(id);
  }

  async findByContratId(contratId: string, options?: {
    page?: number;
    limit?: number;
    action?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }) {
    const where: any = { contratId };
    
    if (options?.action) {
      where.action = options.action;
    }
    
    if (options?.dateDebut || options?.dateFin) {
      where.dateAction = {};
      if (options.dateDebut) {
        where.dateAction.$gte = options.dateDebut;
      }
      if (options.dateFin) {
        where.dateAction.$lte = options.dateFin;
      }
    }

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    return ContratAuditModel.findAll({
      where,
      order: [['dateAction', 'DESC']],
      offset,
      limit
    });
  }
} 