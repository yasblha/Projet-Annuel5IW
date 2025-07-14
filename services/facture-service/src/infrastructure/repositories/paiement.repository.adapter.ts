import { Injectable } from '@nestjs/common';
import { PaiementRepository } from '@Database/repositories/paiement.repository';

/**
 * Adaptateur pour le repository Paiement.
 * Encapsule les appels au repository de la couche Database.
 */
@Injectable()
export class PaiementRepositoryAdapter {
  constructor(private readonly repository: PaiementRepository) {}

  async create(data: any, options: any = {}) {
    return this.repository.create(data, options);
  }

  async findById(id: string, options: any = {}) {
    return this.repository.findById(id, options);
  }

  async findByFactureId(factureId: string, options: any = {}) {
    return this.repository.findByFactureId(factureId, options);
  }

  async findByClientId(clientId: string, options: any = {}) {
    return this.repository.findByClientId(clientId, options);
  }

  async getTotalPaidForInvoice(factureId: string, options: any = {}) {
    return this.repository.getTotalPaidForInvoice(factureId, options);
  }

  async updateStatus(paiementId: string, statut: 'VALIDE' | 'EN_ATTENTE' | 'REJETE' | 'ANNULE', options: any = {}) {
    return this.repository.updateStatus(paiementId, statut, options);
  }

  async update(id: string, data: any, options: any = {}) {
    return this.repository.update(id, data, options);
  }
}
