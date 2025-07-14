import { Injectable } from '@nestjs/common';
import { FactureRepository } from '@Database/repositories/facture.repository';
import { FactureStatut } from '@domain/enums/facture-statut.enum';

/**
 * Adaptateur pour le repository Facture.
 */
@Injectable()
export class FactureRepositoryAdapter {
  constructor(private readonly repository: FactureRepository) {}

  /**
   * Créer une facture
   */
  async create(data: any) {
    return this.repository.create(data);
  }

  /**
   * Trouver des factures selon des critères
   */
  async find(options: any = {}) {
    return this.repository.findAll(options);
  }

  /**
   * Trouver une facture par ID
   */
  async findById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Trouver une facture par numéro
   */
  async findByNumero(numero: string) {
    // Utiliser la méthode findAll avec un filtre sur le numéro
    const results = await this.repository.findAll({
      where: { numero }
    });
    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * Trouver les factures par client ID
   */
  async findByClientId(clientId: string, options: any = {}) {
    return this.repository.findByClientId(clientId, options);
  }

  /**
   * Trouver les factures impayées
   */
  async findUnpaid(options: any = {}) {
    return this.repository.findUnpaid(options);
  }

  /**
   * Trouver les factures impayées (version simple sans inclusions)
   */
  async findUnpaidSimple(options: any = {}) {
    // Utiliser le repository sous-jacent avec une requête plus simple sans inclusions
    const simpleOptions = {
      where: { statut: 'IMPAYEE' },
      ...options
    };
    
    delete simpleOptions.include; // S'assurer qu'il n'y a pas d'inclusions
    
    try {
      // Appeler directement repo.findAll au lieu de findUnpaid pour éviter les inclusions
      return await this.repository.findAll(simpleOptions);
    } catch (error) {
      console.error('Erreur dans findUnpaidSimple:', error);
      return [];
    }
  }

  /**
   * Mettre à jour le statut d'une facture
   */
  async updateStatus(factureId: string, statut: FactureStatut, options: any = {}) {
    // Convertir enum en string compatible si nécessaire
    const statutString = typeof statut === 'string' ? statut : String(statut);
    return this.repository.updateStatus(factureId, statutString as any, options);
  }

  /**
   * Mettre à jour une facture
   */
  async update(id: string, data: any, options: any = {}) {
    return this.repository.update(id, data, options);
  }

  /**
   * Supprimer une facture
   */
  async delete(id: string, options: any = {}) {
    // Utiliser simplement la méthode update pour marquer comme supprimé
    return this.repository.update(id, { 
      deleted: true, 
      dateSupression: new Date(),
      statut: FactureStatut.ANNULEE
    }, options);
  }
}
