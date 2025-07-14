import { Op } from 'sequelize';
import { models } from '../sequelize';

type UserInstance = typeof models.Utilisateur;

export interface CreateUserParams {
    nom: string;
    prenom: string;
    email: string;
    hashMotDePasse: string;
    telephone: string;
    tenantId: string;
    role: 'ADMIN' | 'CLIENT' | 'TECHNICIEN' | 'COMMERCIAL' | 'SUPPORT' | 'COMPTABLE' | 'MANAGER';
    statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
    activationToken?: string;
    activationTokenExpiration?: Date;
}

export interface UpdatePasswordParams {
    userId: number;
    newHash: string;
}

export interface UpdateProfileParams {
    userId: number;
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
        resetToken: string | null;
        resetTokenExpiration: Date | null;

    }>;
}

export interface UpdateStatusParams {
    userId: number;
    statut: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLACKLISTE' | 'ARCHIVE' | 'SUPPRIME';
}

/**
 * Repository Sequelize pur pour la gestion des utilisateurs
 */
export class UserRepository {
    private readonly repo = models.Utilisateur;

    /** Crée un nouvel utilisateur */
    async create(data: {
        nom: string;
        prenom: string;
        email: string;
        role: "ADMIN" | "CLIENT" | "TECHNICIEN" | "COMMERCIAL" | "SUPPORT" | "COMPTABLE" | "MANAGER";
        telephone: string | null;
        hashMotDePasse: string;
        tenantId: string;
        statut: "EN_ATTENTE_VALIDATION" | "ACTIF" | "SUSPENDU" | "BLACKLISTE" | "ARCHIVE" | "SUPPRIME";
        activationToken?: string;
        activationTokenExpiration?: Date;
    }): Promise<UserInstance> {
        return this.repo.create(data);
    }

    /** Recherche un utilisateur par son ID */
    async findById(id: number): Promise<UserInstance> {
        const user = await this.repo.findByPk(id);
        if (!user) throw new Error(`Utilisateur non trouvé (id=${id})`);
        return user;
    }

    /** Recherche un utilisateur par email (insensible à la casse) */
    async findByEmail(email: string): Promise<UserInstance | null> {
        return this.repo.findOne({ where: { email: { [Op.iLike]: email } } });
    }

    async findByPhone(telephone: string | null): Promise<UserInstance | null> {
        return this.repo.findOne({ where: { telephone } });
    }

    /** Retourne le nombre total d'utilisateurs */
    async count(): Promise<number> {
        return this.repo.count();
    }

    /** Recherche un utilisateur par son personnel info */
    async findByPersonalInfo(personalInfo: string): Promise<UserInstance | null> {
        return this.repo.findOne({
            where: {
                [Op.or]: [
                    { nom: { [Op.iLike]: personalInfo } },
                    { prenom: { [Op.iLike]: personalInfo } },
                    { email: { [Op.iLike]: personalInfo } },
                    { telephone: { [Op.iLike]: personalInfo } },
                ],
            },
        });
    }



    /** Met à jour le mot de passe et réinitialise les échecs de connexion */
    async updatePassword({ userId, newHash }: UpdatePasswordParams): Promise<void> {
        const [count] = await this.repo.update(
            {
                hashMotDePasse: newHash,
                dateDerniereMAJMDP: new Date(),
                tentativesEchecs: 0,
                isLocked: false,
                lockedUntil: null,
            },
            { where: { id: userId } }
        );
        if (count === 0) throw new Error(`Utilisateur non trouvé pour mise à jour du mot de passe (id=${userId})`);
    }

    /** Active l'utilisateur et définit son mot de passe */
    async activateUser(userId: number, newHash: string): Promise<void> {
        const [count] = await this.repo.update(
            {
                hashMotDePasse: newHash,
                statut: 'ACTIF',
                dateDerniereMAJMDP: new Date(),
            },
            { where: { id: userId } }
        );
        if (count === 0) throw new Error(`Utilisateur non trouvé pour activation (id=${userId})`);
    }

    /** Enregistre un échec de connexion et applique un lock si nécessaire */
    async registerFailedLogin(
        userId: number,
        maxAttempts = 5,
        lockDurationMs = 30 * 60 * 1000
    ): Promise<void> {
        const user = await this.findById(userId);
        const now = new Date();

        if (user.dernierEchec && now.getTime() - user.dernierEchec.getTime() > 15 * 60 * 1000) {
            user.tentativesEchecs = 1;
        } else {
            user.tentativesEchecs++;
        }
        user.dernierEchec = now;

        if (user.tentativesEchecs >= maxAttempts) {
            user.isLocked = true;
            user.lockedUntil = new Date(now.getTime() + lockDurationMs);
        }

        await user.save();
    }

    /** Réinitialise les compteurs d'échecs et déverrouille l'utilisateur */
    async resetFailedLogins(userId: number): Promise<void> {
        await this.repo.update(
            { tentativesEchecs: 0, dernierEchec: null, isLocked: false, lockedUntil: null },
            { where: { id: userId } }
        );
    }

    /** Vérifie si l'utilisateur est actuellement verrouillé */
    async isLocked(userId: number): Promise<boolean> {
        const user = await this.findById(userId);
        if (!user.isLocked) return false;
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return true;
        }
        await this.resetFailedLogins(userId);
        return false;
    }

    /** Met à jour la date de dernière connexion */
    async touchLastLogin(userId: number): Promise<void> {
        await this.repo.update(
            { dateDerniereConnexion: new Date() },
            { where: { id: userId } }
        );
    }

    /** Met à jour les informations du profil */
    async updateProfile({ userId, updates }: UpdateProfileParams): Promise<void> {
        const [count] = await this.repo.update(updates, { where: { id: userId } });
        if (count === 0) throw new Error(`Utilisateur non trouvé pour mise à jour (id=${userId})`);
    }

    /** Met à jour le statut de l'utilisateur */
    async updateStatus({ userId, statut }: UpdateStatusParams): Promise<void> {
        const [count] = await this.repo.update({ statut }, { where: { id: userId } });
        if (count === 0) throw new Error(`Utilisateur non trouvé pour changement de statut (id=${userId})`);
    }


    /** Supprime (soft-delete) l'utilisateur */
    async remove(userId: number): Promise<void> {
        const user = await this.findById(userId);
        await user.destroy();
    }

    async saveResetToken(userId: string, resetToken: string, resetTokenExpiry: Date): Promise<void> {
        const [count] = await this.repo.update(
          { resetToken, resetTokenExpiry },
          { where: { id: userId } }
        );
        if (count === 0) {
            throw new Error(`Utilisateur non trouvé pour mise à jour du token de réinitialisation (id=${userId})`);
        }
    }


    async findByResetToken(resetToken: string): Promise<UserInstance | null> {
        return this.repo.findOne({ where: { resetToken } });
    }

    async clearResetToken(userId: string): Promise<void> {
        const [count] = await this.repo.update(
          { resetToken: null, resetTokenExpiry: null },
          { where: { id: userId } }
        );
        if (count === 0) {
            throw new Error(`Utilisateur non trouvé pour mise à jour du token de réinitialisation (id=${userId})`);
        }
    }

    /** Recherche un utilisateur par token d'activation */
    async findByActivationToken(activationToken: string): Promise<UserInstance | null> {
        console.log(`🔍 Recherche utilisateur par token d'activation: ${activationToken}`);
        
        const user = await this.repo.findOne({ 
            where: { 
                activationToken,
                activationTokenExpiration: { [Op.gt]: new Date() } // Token non expiré
            } 
        });
        
        console.log(`🔍 Résultat recherche:`, user ? `Trouvé (ID: ${user.id}, Email: ${user.email})` : 'Non trouvé');
        
        if (!user) {
            // Vérifier si le token existe mais est expiré
            const expiredUser = await this.repo.findOne({ 
                where: { activationToken } 
            });
            if (expiredUser) {
                console.log(`⚠️ Token trouvé mais expiré pour l'utilisateur ${expiredUser.email}`);
            } else {
                console.log(`❌ Aucun utilisateur avec ce token d'activation`);
            }
        }
        
        return user;
    }

    /** Efface le token d'activation */
    async clearActivationToken(userId: string): Promise<void> {
        await this.repo.update(
            { activationToken: null, activationTokenExpiration: null },
            { where: { id: userId } }
        );
    }

    /** Méthode de débogage pour vérifier le statut d'un utilisateur */
    async debugUserStatus(email: string): Promise<any> {
        const user = await this.findByEmail(email);
        if (!user) {
            return { error: 'Utilisateur non trouvé' };
        }
        
        return {
            id: user.id,
            email: user.email,
            statut: user.statut,
            statutType: typeof user.statut,
            statutLength: user.statut?.length,
            statutCharCodes: user.statut?.split('').map((c: string) => c.charCodeAt(0)),
            isActif: user.statut === 'ACTIF',
            isActifStrict: user.statut !== 'ACTIF'
        };
    }

    /** Liste paginée et filtrée des utilisateurs */
    async listUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        statut?: string;
    }): Promise<any> {

        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const offset = (page - 1) * limit;
        const where: any = {};
        if (params.role) where.role = params.role;
        if (params.statut) where.statut = params.statut;
        if (params.search) {
            where[Op.or] = [
                { nom: { [Op.iLike]: `%${params.search}%` } },
                { prenom: { [Op.iLike]: `%${params.search}%` } },
                { email: { [Op.iLike]: `%${params.search}%` } },
            ];
        }
        const { rows, count } = await this.repo.findAndCountAll({
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });
        return {
            users: rows,
            total: count,
            page,
            limit,
        };
    }

    /** Mise à jour générique d'un utilisateur */
    async update(id: number, data: Partial<any>) {
        const [count] = await this.repo.update(data, { where: { id } });
        if (count === 0) throw new Error(`Utilisateur non trouvé pour update (id=${id})`);
        return this.findById(id);
    }

    /** Suppression (soft-delete) d'un utilisateur */
    async delete(id: number) {
        return this.remove(id);
    }


}
