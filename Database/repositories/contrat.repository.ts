import { models } from '../sequelize';

export class ContratRepository {
  private readonly repo = models.Contrat;

  async findAll(options?: { offset?: number; limit?: number; where?: any }) {
    return this.repo.findAll(options);
  }

  async findById(id: string) {
    return this.repo.findByPk(id);
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