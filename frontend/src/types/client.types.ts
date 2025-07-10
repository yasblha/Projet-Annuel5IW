export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
  statutContractuel: 'SANS_CONTRAT' | 'EN_NEGOCIATION' | 'EN_ATTENTE_SIGNATURE' | 'CONTRAT_ACTIF' | 'CONTRAT_SUSPENDU' | 'CONTRAT_RESILIE' | 'CONTRAT_EXPIRE';
  statutPaiement: 'A_JOUR' | 'RETARD_LEGER' | 'RETARD_MODERE' | 'RETARD_IMPORTANT' | 'IMPAYE' | 'EN_PROCEDURE' | 'LITIGE';
  statutTechnique: 'OPERATIONNEL' | 'MAINTENANCE' | 'DEFAILLANT' | 'COUPURE' | 'INSTALLATION' | 'DEMENAGEMENT';
  statutAbonnement: 'SANS_ABONNEMENT' | 'ABONNEMENT_ACTIF' | 'ABONNEMENT_SUSPENDU' | 'ABONNEMENT_EXPIRE' | 'EN_CREATION';
  statutFacturation: 'FACTURATION_NORMALE' | 'FACTURATION_SUSPENDUE' | 'FACTURATION_ESTIMEE' | 'FACTURATION_ANNULEE';
  montantImpaye?: number;
  dateDernierPaiement?: string;
  dateDerniereFacture?: string;
  nombreFacturesImpayees?: number;
  tenantId?: string;
  proprietaireEntrepriseId?: string;
  dateCreation: string;
  dateMaj: string;
}

export interface ClientAdresse {
  id: string;
  clientId: string;
  type: string;
  ligne1: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
}

export interface ClientEntreprise {
  id: string;
  nom: string;
  siret?: string;
  adresse?: string;
  contactEmail?: string;
  contactTelephone?: string;
  dateCreation: string;
}

export interface CreateClientRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
  tenantId?: string;
  adresse?: AdresseParams;
  entreprise?: EntrepriseParams;
}

export interface AdresseParams {
  type: string;
  ligne1: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
}

export interface EntrepriseParams {
  nom: string;
  siret?: string;
  adresse?: any;
  contactEmail?: string;
  contactTelephone?: string;
}

export interface ListClientsRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  statut?: string;
}

export interface ListClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 