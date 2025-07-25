import { UserRepository } from '@Database/repositories/user.repository';
import bcrypt from 'bcryptjs';

export class PasswordService {
    constructor(private readonly userRepository: UserRepository) {}
    /** Compare un mot de passe en clair avec un hash */
    async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hash);
    }

    /** Hash un mot de passe avec salage */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /** Met à jour le hash du mot de passe */
    async updatePassword(userId: number, newHash: string): Promise<void> {
        await this.userRepository.updatePassword({ userId, newHash });
    }

    /** find by personnal info */
    async findByPersonnalInfo(name: string): Promise<any> {
        return this.userRepository.findByPersonalInfo(name);
    }

    /** Vérifie si le mot de passe est suffisamment fort (CNIL) */
    validatePasswordStrength(password: string): boolean {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{};:'",.<>?\\|`~_+=/-]).{12,}$/;
        return strongRegex.test(password);
    }

    /** Génère un mot de passe temporaire aléatoire */
    generateTemporaryPassword(length = 16): string {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    /** Vérifie si le mot de passe a expiré (par défaut 60 jours) */
    isPasswordExpired(lastUpdate: Date, maxAgeDays = 60): boolean {
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        return Date.now() - new Date(lastUpdate).getTime() > maxAgeMs;
    }

    /** Vérifie si l'utilisateur doit forcer le changement de mot de passe */
    async shouldForcePasswordChange(userId: number): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        return this.isPasswordExpired(user.dateDerniereMAJMDP);
    }
}
