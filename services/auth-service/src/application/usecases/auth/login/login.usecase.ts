import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { LoginErrors } from '@domain/errors/login.errors';

export class LoginUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService
    ) {}

    public async execute(email: string, password: string): Promise<User> {
        console.log(`🔍 Tentative de connexion pour: ${email}`);
        
        // 1. Chercher l'utilisateur par email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            console.log(`❌ Utilisateur non trouvé: ${email}`);
            throw LoginErrors.UsernameDoesNotExist();
        }
        
        console.log(`✅ Utilisateur trouvé: ${user.email}, statut: ${user.statut}`);

        // 2. Vérifier si le compte est verrouillé
        if (user.isLocked) {
            if (user.lockedUntil && user.lockedUntil > new Date()) {
                console.log(`⛔ Compte verrouillé: ${email}`);
                throw new LoginErrors('⛔ Compte verrouillé temporairement. Réessayez plus tard.');
            } else {
                // Déverrouiller si la période est passée
                await this.userRepository.resetFailedLogins(user.id);
                console.log(`🔓 Compte déverrouillé: ${email}`);
            }
        }

        // 3. Vérifier le mot de passe
        console.log(`🔐 Vérification du mot de passe pour: ${email}`);
        const isValid = await this.passwordService.comparePassword(password, user.hashMotDePasse);
        console.log(`🔐 Résultat vérification mot de passe: ${isValid}`);
        
        if (!isValid) {
            await this.userRepository.registerFailedLogin(user.id);
            console.log(`❌ Mot de passe incorrect pour: ${email}`);
            throw new LoginErrors('❌ Email ou mot de passe incorrect.');
        }

        // 4. Vérifier le statut du compte
        console.log(`🔍 Statut du compte: "${user.statut}" (type: ${typeof user.statut})`);
        console.log(`🔍 Comparaison avec 'ACTIF': ${user.statut === 'ACTIF'}`);
        console.log(`🔍 Comparaison stricte: ${user.statut !== 'ACTIF'}`);
        
        if (user.statut !== 'ACTIF') {
            console.log(`⛔ Compte non actif: ${email}, statut: "${user.statut}"`);
            throw new LoginErrors('⛔ Compte inactif ou en attente de validation.');
        }

        // 5. Réinitialiser les tentatives d'échec
        await this.userRepository.resetFailedLogins(user.id);
        await this.userRepository.touchLastLogin(user.id);
        
        console.log(`✅ Connexion réussie pour: ${email}`);
        return user;
    }
}