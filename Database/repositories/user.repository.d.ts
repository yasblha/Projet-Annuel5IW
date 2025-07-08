import { models } from '@Database/sequelize';
type UserInstance = typeof models.Utilisateur;
export interface CreateUserParams {
    nom: string;
    prenom: string;
    email: string;
    hashMotDePasse: string;
    telephone?: string;
    tenantId?: string;
}
export interface UpdatePasswordParams {
    userId: string;
    newHash: string;
}
export interface UpdateProfileParams {
    userId: string;
    updates: Partial<{
        nom: string;
        prenom: string;
        email: string;
        telephone: string | null;
        role: 'ADMIN' | 'CLIENT' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER';
        tenantId: string;
        statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
        isLocked: boolean;
        isDeleted: boolean;
        isActive: boolean;
        isArchived: boolean;
        isSuspended: boolean;
        isBlacklisted: boolean;
    }>;
}
export interface UpdateStatusParams {
    userId: string;
    statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
}
export declare class UserRepository {
    private readonly repo;
    create(data: {
        nom: string;
        prenom: string;
        email: string;
        role: "ADMIN" | "CLIENT" | "TECHNICIEN" | "COMMERCIAL" | "SUPPORT" | "COMPTABLE" | "MANAGER";
        telephone: string | null;
        hashMotDePasse: string;
        tenantId: string;
        statut: "EN_ATTENTE_VALIDATION" | "ACTIF" | "SUSPENDU" | "BLACKLISTE" | "ARCHIVE" | "SUPPRIME";
    }): Promise<UserInstance>;
    findById(id: number): Promise<UserInstance>;
    findByEmail(email: string): Promise<UserInstance | null>;
    findByPhone(telephone: string | null): Promise<UserInstance | null>;
    findByPersonalInfo(personalInfo: string): Promise<UserInstance | null>;
    updatePassword({ userId, newHash }: UpdatePasswordParams): Promise<void>;
    activateUser(userId: string, newHash: string): Promise<void>;
    registerFailedLogin(userId: number, maxAttempts?: number, lockDurationMs?: number): Promise<void>;
    resetFailedLogins(userId: number): Promise<void>;
    isLocked(userId: number): Promise<boolean>;
    touchLastLogin(userId: string): Promise<void>;
    updateProfile({ userId, updates }: UpdateProfileParams): Promise<void>;
    updateStatus({ userId, statut }: UpdateStatusParams): Promise<void>;
    remove(userId: number): Promise<void>;
    listUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        statut?: string;
    }): Promise<any>;

}
export {};
