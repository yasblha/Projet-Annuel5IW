export declare class AdresseDto {
    ligne1: string;
    ligne2?: string;
    codePostal: string;
    ville: string;
    pays?: string;
    type?: string;
}
export declare class EntrepriseDto {
    nom: string;
    siret?: string;
    contactEmail?: string;
    contactTelephone?: string;
}
export declare class CreateClientDto {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    type: 'PARTICULIER' | 'ENTREPRISE';
    statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
    adresse?: AdresseDto;
    entreprise?: EntrepriseDto;
    adresseLigne1?: string;
    adresseLigne2?: string;
    codePostal?: string;
    ville?: string;
    token?: string;
}
