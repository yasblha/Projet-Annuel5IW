import { Injectable } from '@nestjs/common';
import { LigneFactureRepository } from '@Database/repositories/ligneFacture.repository';

/**
 * Adaptateur pour le repository LigneFacture.
 * Encapsule les appels au repository de la couche Database.
 */
@Injectable()
export class LigneFactureRepositoryAdapter {
  constructor(private readonly repository: LigneFactureRepository) {}

  async create(data: any, options: any = {}) {
    return this.repository.create(data, options);
  }

  async bulkCreate(data: any[], options: any = {}) {
    return this.repository.bulkCreate(data, options);
  }

  async findById(id: string, options: any = {}) {
    return this.repository.findById(id, options);
  }

  async findByFactureId(factureId: string, options: any = {}) {
    return this.repository.findByFactureId(factureId, options);
  }

  async getTotalForInvoice(factureId: string, options: any = {}) {
    return this.repository.getTotalForInvoice(factureId, options);
  }

  async groupByType(factureId: string, options: any = {}) {
    return this.repository.groupByType(factureId, options);
  }

  async update(id: string, data: any, options: any = {}) {
    return this.repository.update(id, data, options);
  }

  async deleteByFactureId(factureId: string, options: any = {}) {
    return this.repository.deleteByFactureId(factureId, options);
  }
}
