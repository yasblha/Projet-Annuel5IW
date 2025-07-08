import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { PasswordValidator } from '@application/validators/password.validator';
import { RegisterErrors } from '@domain/errors/register.errors';
import { User } from '@domain/entité/user';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // 1. Récupérer l'utilisateur
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé.');
    }

    // 2. Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.hashMotDePasse);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect.');
    }

    // 3. Vérifier que le nouveau mot de passe est différent
    if (currentPassword === newPassword) {
      throw new Error('Le nouveau mot de passe doit être différent de l\'actuel.');
    }

    // 4. Valider le nouveau mot de passe
    if (!this.passwordService.validatePasswordStrength(newPassword)) {
      throw RegisterErrors.WeakPassword();
    }

    // 5. Vérifier que le mot de passe ne contient pas d'informations personnelles
    const personalInfo = [user.nom, user.prenom, user.email, user.telephone].filter(Boolean) as string[];
    const hasPersonalInfo = PasswordValidator.validatePasswordPersonalInfo(newPassword, personalInfo);
    if (hasPersonalInfo) {
      throw RegisterErrors.PasswordContainsPersonalInfo();
    }

    // 6. Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.userRepository.updatePassword({ userId: user.id, newHash: hashedPassword });

    return {
      success: true,
      message: 'Mot de passe modifié avec succès.'
    };
  }
}