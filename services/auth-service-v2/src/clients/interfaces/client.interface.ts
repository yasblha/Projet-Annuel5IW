export interface Client {
  id: string;
  agencyId: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  statut: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: {
    ligne1?: string;
    ligne2?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  };
  entreprise?: {
    nom?: string;
    siret?: string;
    contactEmail?: string;
    contactTelephone?: string;
  };
  impaye?: number;
  facturesImpayees?: number;
  dernierPaiement?: Date;
  dateCreation: Date;
  dateMaj: Date;
  createdAt: Date;
  updatedAt: Date;
}
