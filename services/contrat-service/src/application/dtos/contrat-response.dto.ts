import { CosignataireResponseDto } from './cosignataire.dto';

export class ContratResponseDto {
  id: string;
  numero: string;
  proprietaireId: string;
  typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE';
  dateDebut: Date;
  dateFin: Date | null;
  statut: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE' | 'RESILIE';
  statutSignature: 'EN_ATTENTE' | 'SIGNE' | 'REFUSE';
  objet: string | null;
  montantTotal: number | null;
  dateSignature: Date | null;
  dateResiliation: Date | null;
  motifResiliation: string | null;
  compteurId: string | null;
  abonnementId: string | null;
  clientId: string | null;
  tenantId: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  dateCreation: Date;
  dateMaj: Date;
  
  // Calculs dérivés
  dureeEnJours: number;
  isActif: boolean;
  isSigned: boolean;
  isExpire: boolean;
  isEnCours: boolean;
  
  // Relations
  cosignataires?: CosignataireResponseDto[];
  auditTrail?: any[];
  compteurHistorique?: any[];
} 