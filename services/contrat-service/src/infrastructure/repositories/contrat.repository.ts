import { Injectable } from '@nestjs/common';
import { ContratRepository as BaseContratRepository } from '@Database/repositories/contrat.repository';
import { models } from '@Database/sequelize';
import { Op, fn, col } from '@Database/sequelize';

/**
 * Adaptateur Nest pour le repository Contrat.
 * Permet d'ajouter des helpers (multi-tenant, pagination par défaut, etc.)
 * sans dupliquer la logique Sequelize située dans la couche Database.
 */
@Injectable()
export class ContratRepository extends BaseContratRepository {
  /**
   * Exemple : filtrage tenant par défaut si fourni.
   */
  async findAllForTenant(tenantId: string, options: { offset?: number; limit?: number } = {}) {
    return super.findAll({ ...options, where: { tenantId } });
  }

  async findById(id: string, tenantId?: string) {
    const contrat: any = await super.findById(id);
    if (tenantId && contrat && contrat.tenantId !== tenantId) {
      return null;
    }
    return contrat;
  }

  /**
   * Variante tenant-safe de findById
   */
  async findByIdWithTenant(id: string, tenantId?: string) {
    return this.findById(id, tenantId);
  }

  /**
   * Recherche par numéro métier ou brouillon.
   */
  async findByNumero(numero: string, tenantId?: string) {
    const where: any = { numero };
    if (tenantId) where.tenantId = tenantId;
    return models.Contrat.findOne({ where });
  }

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

  async update(id: string, data: any, tenantId?: string) {
    if (tenantId) {
      // ensure belongs to tenant
      const exists = await this.findById(id, tenantId);
      if (!exists) return null;
    }
    await super.update(id, data);
    return super.findById(id);
  }

  async delete(id: string, tenantId?: string): Promise<boolean> {
    if (tenantId) {
      const exists = await this.findById(id, tenantId);
      if (!exists) return false;
    }
    const deleted = await super.delete(id);
    return !!deleted;
  }

  // ---------- Compteur helpers ----------
  private get historiqueModel() {
    const m = models.ContratCompteurHistorique;
    if (!m) throw new Error('Model ContratCompteurHistorique not initialized');
    return m;
  }

  async getCurrentCompteur(contratId: string, tenantId?: string) {
    const where: any = { contratId, dateFin: null };
    if (tenantId) where.tenantId = tenantId;
    return this.historiqueModel.findOne({ where, order: [['dateDebut', 'DESC']] });
  }

  async createCompteurHistorique(data: any) {
    return this.historiqueModel.create(data);
  }

  async dissocierCompteur(contratId: string, compteurId: string, motif: string, tenantId?: string) {
    const current = await this.getCurrentCompteur(contratId, tenantId);
    if (!current) return null;
    await current.update({ dateFin: new Date(), motif });
    // create historique de dissociation
    return this.createCompteurHistorique({
      contratId,
      compteurId,
      typeAction: 'DISSOCIATION',
      dateDebut: new Date(),
      motif,
      tenantId,
    });
  }

  async getCompteurHistorique(contratId: string, tenantId?: string) {
    const where: any = { contratId };
    if (tenantId) where.tenantId = tenantId;
    return this.historiqueModel.findAll({ where, order: [['dateDebut', 'DESC']] });
  }

  // ---------- Recherche avancée de contrats ----------
  async searchContrats(params: {
    search?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
    proprietaireId?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const { search, statut, dateDebut, dateFin, proprietaireId, tenantId } = params;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (statut) where.statut = statut;
    if (proprietaireId) where.proprietaireId = proprietaireId;

    if (dateDebut || dateFin) {
      where.dateCreation = {};
      if (dateDebut) where.dateCreation[Op.gte] = dateDebut;
      if (dateFin) where.dateCreation[Op.lte] = dateFin;
    }

    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { numero: like },
        { reference: like },
        { description: like },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await models.Contrat.findAndCountAll({
      where,
      offset,
      limit,
      order: [['dateCreation', 'DESC']],
    });

    return { contrats: rows, total: count };
  }

  // ---------- Statistiques contrats ----------
  async getContratStats(tenantId: string): Promise<any> {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const total = await models.Contrat.count({ where });

    const stats = await models.Contrat.findAll({
      attributes: ['statut', [fn('COUNT', col('id')), 'count']],
      where,
      group: ['statut'],
      raw: true,
    });

    const byStatut: Record<string, number> = {};
    stats.forEach((s: any) => {
      byStatut[s.statut] = parseInt(s.count as string, 10);
    });

    return { total, byStatut };
  }
}

// CosignataireRepository has been moved to a dedicated file for SRP compliance
