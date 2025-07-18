import { AdresseDto, EntrepriseDto } from './create-client.dto';
export declare class UpdateClientDto {
    id?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    type?: 'PARTICULIER' | 'ENTREPRISE';
    statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
    adresse?: AdresseDto;
    entreprise?: EntrepriseDto;
}
