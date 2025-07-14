import { models } from '../sequelize';
import { Transaction } from 'sequelize';

/**
 * Repository Sequelize pour l'entité **Compteur**.
 * Aucune dépendance NestJS → peut être injecté où l’on veut.
 */
export class CompteurRepository {
  private readonly repo = models?.Compteur;

  /*--------------------------------------------------------------
   *         MÉTHODES MÉTIER
   *-------------------------------------------------------------*/

  /** TRUE si ≥1 compteur ACTIF est associé au contrat. */
  async hasActiveMeter(
    contratId: string,
    options: { transaction?: Transaction } = {},
  ): Promise<boolean> {
    const count = await this.repo.count({
      where: { contratId, statut: 'ACTIF' },
      transaction: options.transaction,
    });
    return count > 0;
  }

  /** Tous les compteurs – ou, si présente, table d’historique. */
  async findAllByContrat(contratId: string, tenantId?: string) {
    if (models?.ContratCompteurHistorique) {
      const where: any = { contratId };
      if (tenantId) where.tenantId = tenantId;
      return models.ContratCompteurHistorique.findAll({ where });
    }

    const where: any = { contratId };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findAll({ where });
  }

  /*--------------------------------------------------------------
   *         CRUD MINIMAL
   *-------------------------------------------------------------*/

  async create(data: any, options: { transaction?: Transaction } = {}) {
    return this.repo.create(data, { transaction: options.transaction });
  }

  async findById(id: string) {
    return this.repo.findByPk(id);
  }

  async findAll(options: any = {}) {
    return this.repo.findAll(options);
  }

  async update(
    id: string,
    data: any,
    options: { transaction?: Transaction } = {},
  ) {
    const compteur: any = await this.repo.findByPk(id);
    if (!compteur) return null;
    return compteur.update(data, { transaction: options.transaction });
  }

  async delete(id: string, options: { transaction?: Transaction } = {}) {
    return this.repo.destroy({ where: { id }, transaction: options.transaction });
  }
}
