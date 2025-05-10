import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { RegisterErrors } from '@domain/errors/register.errors';

export class RegisterInterfaceUsecase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService
    ) {}

    public async execute(user: User): Promise<User> {
        // Vérifie les champs obligatoires
        const mandatoryFields = ['nom', 'prenom', 'email', 'hashMotDePasse', 'role', 'tenantId'];
        const missingFields = mandatoryFields.filter((field) => !user[field as keyof User]);
        if (missingFields.length > 0) {
            throw RegisterErrors.MissingMandatoryFields(missingFields);
        }

        // Vérifie le format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            throw RegisterErrors.InvalidEmailFormat();
        }

        // Vérifie si l'email est déjà utilisé
        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) throw RegisterErrors.EmailAlreadyUsed();

        // Vérifie si le téléphone est déjà utilisé
        if (user.telephone) {
            const existingPhone = await this.userRepository.findByPhone(user.telephone);
            if (existingPhone) throw RegisterErrors.PhoneAlreadyUsed();
        }

        // Vérifie la solidité du mot de passe
        if (!this.passwordService.validatePasswordStrength(user.hashMotDePasse)) {
            throw RegisterErrors.WeakPassword();
        }

        // Vérifie que le mot de passe ne contient pas d'infos personnelles
        const containsPersonalInfo = await this.passwordService.validatePasswordPersonalInfo(
            user.hashMotDePasse,
            user.id
        );
        if (containsPersonalInfo) {
            throw RegisterErrors.PasswordContainsPersonalInfo();
        }

        // Hash du mot de passe
        const hashed = await this.passwordService.hashPassword(user.hashMotDePasse);

        // Création du nouvel utilisateur
        return await this.userRepository.create({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            telephone: user.telephone ?? null,
            hashMotDePasse: hashed,
            tenantId: user.tenantId,
            statut: user.statut,
        });
    }
}
