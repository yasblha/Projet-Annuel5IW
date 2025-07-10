import { models } from '../sequelize';

export class EntrepriseRepository {
  private readonly repo = models.Entreprise;

  async create(data: any) {
    return this.repo.create(data);
  }

  async findBySiret(siret: string) {
    return this.repo.findOne({ where: { siret } });
  }

  async findById(id: string) {
    return this.repo.findByPk(id);
  }

  async update(id: string, data: any) {
    return this.repo.update(data, { where: { id } });
  }

  async delete(id: string) {
    return this.repo.destroy({ where: { id } });
  }

  async findUsers(id: string) {
    return models.Utilisateur.findAll({ where: { proprietaireEntrepriseId: id } });
  }
} 