import { Injectable } from '@nestjs/common';
import { LotFacturationRepository } from '@Database/repositories/lotFacturation.repository';

/**
 * Adaptateur pour le repository LotFacturation.
 * Encapsule les appels au repository de la couche Database.
 */
@Injectable()
export class LotFacturationRepositoryAdapter {
  constructor(private readonly repository: LotFacturationRepository) {}

  async create(data: any, options: any = {}) {
    return this.repository.create(data, options);
  }

  async findById(id: string, options: any = {}) {
    return this.repository.findById(id, options);
  }

  async findAll(filter: any = {}, options: any = {}) {
    return this.repository.findAll(filter, options);
  }

  async findProcessing(options: any = {}) {
    return this.repository.findProcessing(options);
  }

  async findByPeriod(mois: number, annee: number, options: any = {}) {
    return this.repository.findByPeriod(mois, annee, options);
  }

  async updateStatus(lotId: string, statut: 'EN_COURS' | 'TERMINE' | 'ERREUR', options: any = {}) {
    return this.repository.updateStatus(lotId, statut, options);
  }

  async updateStats(lotId: string, stats: any, options: any = {}) {
    return this.repository.updateStats(lotId, stats, options);
  }

  async update(id: string, data: any, options: any = {}) {
    return this.repository.update(id, data, options);
  }
}
