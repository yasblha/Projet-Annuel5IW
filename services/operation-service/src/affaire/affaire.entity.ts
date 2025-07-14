export type AffaireStatus = 'EN_COURS' | 'VALIDEE' | 'REFUSEE';

export interface Affaire {
  id: string;
  clientId: string;
  zoneCode: string;
  debitDemande: number;
  statut: AffaireStatus;
  montantDevis?: number;
  devis?: Record<string, any>;
  validationAssainissement: boolean;
  createdAt: Date;
  updatedAt: Date;
}
