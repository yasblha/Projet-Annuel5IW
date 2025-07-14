import { Injectable } from '@nestjs/common';
import { UpdateContratDto } from '../dtos/update-contrat.dto';
import { ContratResponseDto } from '../dtos/contrat-response.dto';

@Injectable()
export class UpdateContratUseCase {
  async execute(dto: UpdateContratDto): Promise<ContratResponseDto> {
    return {
      id: dto.id,
      numero: dto.numero,
      proprietaireId: '',
      typeProprietaire: 'UTILISATEUR',
      dateDebut: new Date(),
      dateFin: null,
      statut: dto.statut,
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