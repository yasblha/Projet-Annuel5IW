export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  rib?: string;
  modePaiement?: 'PRELEVEMENT' | 'VIREMENT' | 'CHEQUE' | 'CARTE' | 'ESPECES' | 'AUTRE';
  tenantId?: string;
  dateCreation: string;
  dateMaj: string;
  adresse?: ClientAdresse;
  entreprise?: ClientEntreprise;
}

export interface ClientAdresse {
  id?: string;
  clientId?: string;
  type: 'PRINCIPALE' | 'FACTURATION' | 'LIVRAISON';
  ligne1: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
  // Propriétés pour la compatibilité avec l'ancien format
  rue?: string;
}

export interface ClientEntreprise {
  id?: string;
  nom: string;
  siret?: string;
  adresse?: any;
  contactEmail?: string;
  contactTelephone?: string;
}

export interface CreateClientRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  rib?: string;
  modePaiement?: 'PRELEVEMENT' | 'VIREMENT' | 'CHEQUE' | 'CARTE' | 'ESPECES' | 'AUTRE';
  tenantId?: string;
  adresse?: AdresseParams;
  entreprise?: EntrepriseParams;
}

export interface AdresseParams {
  type: 'PRINCIPALE' | 'FACTURATION' | 'LIVRAISON';
  ligne1?: string;
  ligne2?: string;
  codePostal: string;
  ville: string;
  pays: string;
  // Propriétés pour la compatibilité avec l'ancien format
  rue?: string;
  clientId?: string;
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