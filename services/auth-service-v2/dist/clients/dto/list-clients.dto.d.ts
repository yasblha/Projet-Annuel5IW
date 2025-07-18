export declare class ListClientsDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'PARTICULIER' | 'ENTREPRISE';
    statut?: 'PROSPECT' | 'ACTIF' | 'SUSPENDU' | 'INACTIF' | 'RESILIE' | 'ARCHIVE';
}
