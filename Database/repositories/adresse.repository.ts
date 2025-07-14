import { models } from '../sequelize';

export class AdresseRepository {
  private readonly repo = models.Adresse;

  async create(data: any) {
    return this.repo.create(data);
  }

  async findByUtilisateurId(utilisateurId: string) {
    return this.repo.findAll({ where: { utilisateurId } });
  }

  async findById(id: string) {
    return this.repo.findByPk(id);
  }

  async findByType(utilisateurId: string, type: string) {
    return this.repo.findOne({ where: { utilisateurId, type } });
  }

  async update(id: string, data: any) {
    return this.repo.update(data, { where: { id } });
  }

  async delete(id: string) {
    return this.repo.destroy({ where: { id } });
  }
} 