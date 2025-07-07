import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { RegisterErrors } from '@domain/errors/register.errors';
import { PasswordValidator } from '@application/validators/password.validator';
import { randomBytes } from 'crypto';

export class RegisterInterfaceUsecase {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly passwordService: PasswordService,
      private readonly passwordValidator: typeof PasswordValidator
    ) {}

    public async execute(user: User): Promise<{ user: User; activationToken: string }> {
        const requiredFields = ['nom', 'prenom', 'email', 'hashMotDePasse', 'role'];
        const missingFields = this.passwordValidator.getMissingFields(user, requiredFields);

        if (missingFields.length > 0) {
            throw RegisterErrors.MissingMandatoryFields(missingFields);
        }

        if (!this.passwordValidator.validateEmailFormat(user.email)) {
            throw RegisterErrors.InvalidEmailFormat();
        }

        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) {
            throw RegisterErrors.EmailAlreadyUsed();
        }

        if (user.telephone) {
            const existingPhone = await this.userRepository.findByPhone(user.telephone);
            if (existingPhone) {
                throw RegisterErrors.PhoneAlreadyUsed();
            }
        }

        if (!this.passwordService.validatePasswordStrength(user.hashMotDePasse)) {
            throw RegisterErrors.WeakPassword();
        }

        const hasPersonalInfo = this.passwordValidator.validatePasswordPersonalInfo(
          user.hashMotDePasse,
          [user.nom, user.prenom, user.email, user.telephone].filter(Boolean) as string[]
        );
        if (hasPersonalInfo) {
            throw RegisterErrors.PasswordContainsPersonalInfo();
        }

        const hashed = await this.passwordService.hashPassword(user.hashMotDePasse);
        const activationToken = randomBytes(20).toString('hex');
        const activationTokenExpiration = new Date();
        activationTokenExpiration.setHours(activationTokenExpiration.getHours() + 24); // Expire dans 24h

        console.log(`🔐 Génération token d'activation: ${activationToken}`);
        console.log(`⏰ Expiration: ${activationTokenExpiration}`);

        const createdUser = await this.userRepository.create({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            telephone: user.telephone ?? null,
            hashMotDePasse: hashed,
            tenantId: user.tenantId,
            statut: user.statut,
            activationToken,
            activationTokenExpiration,
        });

        console.log(`✅ Utilisateur créé avec token d'activation: ${createdUser.email}`);
        console.log(`🔍 Token sauvegardé en DB: ${createdUser.activationToken}`);

        return { user: createdUser, activationToken };
    }
}
