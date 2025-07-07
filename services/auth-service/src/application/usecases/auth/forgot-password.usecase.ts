import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ForgotPasswordUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(email: string): Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
    userId?: number;
  }> {
    try {
      // 1. Trouver l'utilisateur par email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe
        return {
          success: true,
          message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé',
        };
      }

      // 2. Vérifier si l'utilisateur est actif
      if (user.statut !== 'ACTIF') {
        return {
          success: false,
          message: 'Ce compte n\'est pas actif. Veuillez contacter l\'administrateur.',
        };
      }

      // 3. Générer un token de réinitialisation
      const resetToken = this.passwordService.generateTemporaryPassword(32);
      const resetTokenExpiration = new Date();
      resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1); // Expire dans 1 heure

      // 4. Mettre à jour l'utilisateur avec le token et sa date d'expiration
      await this.userRepository.updateProfile({
        userId: user.id,
        updates: {
          resetToken,
          resetTokenExpiration,
        },
      });

      return {
        success: true,
        message: 'Un lien de réinitialisation a été généré',
        resetToken,
        userId: user.id,
      };
    } catch (error) {
      console.error('Erreur dans ForgotPasswordUsecase:', error);
      return {
        success: false,
        message: "Une erreur est survenue lors du traitement de votre demande",
      };
    }
  }
}