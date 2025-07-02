// Database/repositories/user.repository.ts
import { Op } from 'sequelize';
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
        statut: "EN_ATTENTE_VALIDATION" | "ACTIF" | "SUSPENDU" | "BLACKLISTE" | "ARCHIVE" | "SUPPRIME"
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
    async activateUser(userId: string, newHash: string): Promise<void> {
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
    async touchLastLogin(userId: string): Promise<void> {
        await this.repo.update(
            { dateDerniereConnexion: new Date() },
            { where: { id: userId } }
        );
    }

    /** Supprime (soft-delete) l'utilisateur */
    async remove(userId: number): Promise<void> {
        const user = await this.findById(userId);
        await user.destroy();
    }
}
