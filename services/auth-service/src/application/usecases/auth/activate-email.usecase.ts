import { UserRepository } from '@Database/repositories/user.repository';
import { PasswordService } from '@application/services/password.service';
import { ClientProxy } from '@nestjs/microservices';

export class ActivateEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly mailerClient: ClientProxy
  ) {}

  async execute(token: string, password: string): Promise<any> {
    console.log(`🔍 Tentative d'activation avec token: ${token}`);
    
    // Rechercher l'utilisateur par token d'activation
    const user = await this.userRepository.findByActivationToken(token);
    console.log(`🔍 Résultat recherche par token:`, user ? `Utilisateur trouvé (ID: ${user.id}, Email: ${user.email}, Statut: ${user.statut})` : 'Aucun utilisateur trouvé');
    
    if (!user) {
      console.log(`❌ Token d'activation invalide ou expiré: ${token}`);
      throw new Error('Token d\'activation invalide ou expiré');
    }
    
    console.log(`✅ Utilisateur trouvé pour activation: ${user.email}, statut actuel: ${user.statut}`);
    
    // Hasher le nouveau mot de passe
    const hash = await this.passwordService.hashPassword(password);
    console.log(`🔐 Mot de passe hashé avec succès`);
    
    // Activer l'utilisateur et définir le nouveau mot de passe
    console.log(`🔄 Activation de l'utilisateur ${user.id}...`);
    await this.userRepository.activateUser(Number(user.id), hash);
    console.log(`✅ Utilisateur activé avec succès`);
    
    // Effacer le token d'activation
    console.log(`🧹 Effacement du token d'activation...`);
    await this.userRepository.clearActivationToken(user.id);
    console.log(`✅ Token d'activation effacé`);
    
    // Récupérer l'utilisateur mis à jour
    const activatedUser = await this.userRepository.findById(Number(user.id));
    console.log(`🔍 Utilisateur après activation: ${activatedUser.email}, nouveau statut: ${activatedUser.statut}`);
    
    // Envoyer un email de confirmation d'activation
    console.log(`📧 Envoi email de confirmation d'activation...`);
    this.mailerClient.emit('user.activated', {
      email: activatedUser.email,
      firstname: activatedUser.prenom,
    });
    console.log(`✅ Email de confirmation envoyé`);
    
    return activatedUser;
  }
} 