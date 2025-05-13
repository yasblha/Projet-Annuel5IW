export class User {
    constructor(
        public id: string | undefined,
        public nom: string,
        public prenom: string,
        public email: string,
        public hashMotDePasse: string,
        public dateDerniereMAJMDP: Date,
        public isLocked: boolean,
        public lockedUntil: Date | null,
        public tentativesEchecs: number,
        public dernierEchec: Date | null,
        public tenantId: string,
        public telephone: string | null,
        public role: 'ADMIN' | 'CLIENT' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER',
        public statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME',
        public dateDerniereConnexion: Date | null,
        public createdAt: Date,
        public updatedAt: Date | null,
        /*public deletedAt: Date | null = null,
        public isDeleted: boolean = false,
        public isActive: boolean = true,
        public isArchived: boolean = false,
        public isSuspended: boolean = false,
        public isBlacklisted: boolean = false,
        public isWaitingValidation: boolean = false,*/

        ) {}
}