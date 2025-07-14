import { Injectable } from '@nestjs/common';
import { ContratResponseDto } from '../dtos/contrat-response.dto';

@Injectable()
export class GetContratUseCase {
  async execute(id: string): Promise<ContratResponseDto> {
    // Simple placeholder implementation, should call repository
    return {
      id,
      numero: 'C-001',
      proprietaireId: '',
      typeProprietaire: 'UTILISATEUR',
      dateDebut: new Date(),
      dateFin: null,
      statut: 'EN_ATTENTE',
      statutSignature: 'EN_ATTENTE',
      objet: null,
      montantTotal: null,
      dateSignature: null,
      dateResiliation: null,
      motifResiliation: null,
      compteurId: null,
      abonnementId: null,
      clientId: null,
      tenantId: null,
      createdBy: null,
      updatedBy: null,
      dateCreation: new Date(),
      dateMaj: new Date(),
      dureeEnJours: 0,
      isActif: false,
      isSigned: false,
      isExpire: false,
      isEnCours: false,
      cosignataires: [],
      auditTrail: [],
      compteurHistorique: []
    } as any;
  }
}