import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // 1. Trouver l'utilisateur par le token de réinitialisation
      const user = await this.userRepository.findByResetToken(token);
      if (!user) {
        throw new NotFoundException('Token de réinitialisation invalide ou expiré');
      }

      // 2. Vérifier si le token n'est pas expiré
      if (user.resetTokenExpiration && new Date() > user.resetTokenExpiration) {
        throw new BadRequestException('Token de réinitialisation expiré');
      }

      // 3. Valider le nouveau mot de passe
      if (!this.passwordService.validatePasswordStrength(newPassword)) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 12 caractères avec majuscule, minuscule, chiffre et symbole');
      }

      // 4. Hasher le nouveau mot de passe
      const hashedPassword = await this.passwordService.hashPassword(newPassword);

      // 5. Mettre à jour l'utilisateur
      await this.userRepository.updatePassword({
        userId: user.id,
        newHash: hashedPassword,
      });
      
      // 6. Nettoyer le token de réinitialisation
      await this.userRepository.updateProfile({
        userId: user.id,
        updates: {
          resetToken: null,
          resetTokenExpiration: null,
        },
      });

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      console.error('Erreur dans ResetPasswordUseCase:', error);
      throw error;
    }
  }
} 