export interface Client {
    id: string;
    agencyId: string;
    type: string;
    statut: string;
    nom: string;
    prenom?: string;
    email: string;
    telephone?: string;
    adresseLigne1?: string;
    adresseLigne2?: string;
    codePostal?: string;
    ville?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
