import { UserRepository } from '@Database/repositories/user.repository';
import { User } from '@domain/entité/user';
import { PasswordService } from '@application/services/password.service';
import { RegisterErrors } from '@domain/errors/register.errors';
import { ValidationService } from '@application/services/validation.service';

export class AdminRegisterUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService
    ) {}

    public async execute(
        admin: User,        // L'utilisateur qui effectue la création
        newUser: User       // Le nouvel utilisateur à créer
    ): Promise<User> {
        if (admin.role !== 'ADMIN') {
            throw RegisterErrors.UnauthorizedAction('Seul un administrateur peut créer de nouveaux utilisateurs.');
        }

        const mandatoryFields = ['nom', 'prenom', 'email', 'hashMotDePasse', 'role', 'tenantId'];
        const missingFields = ValidationService.getMissingFields(newUser, mandatoryFields);
        if (missingFields.length > 0) {
            throw RegisterErrors.MissingMandatoryFields(missingFields);
        }

        if (!ValidationService.validateEmailFormat(newUser.email)) {
            throw RegisterErrors.InvalidEmailFormat();
        }

        const existingUser = await this.userRepository.findByEmail(newUser.email);
        if (existingUser) throw RegisterErrors.EmailAlreadyUsed();

        if (newUser.telephone) {
            const existingPhone = await this.userRepository.findByPhone(newUser.telephone);
            if (existingPhone) throw RegisterErrors.PhoneAlreadyUsed();
        }

        if (!this.passwordService.validatePasswordStrength(newUser.hashMotDePasse)) {
            throw RegisterErrors.WeakPassword();
        }

        const containsInfo = await this.passwordService.validatePasswordPersonalInfo(newUser.hashMotDePasse, newUser.id);
        if (containsInfo) throw RegisterErrors.PasswordContainsPersonalInfo();

        const hashed = await this.passwordService.hashPassword(newUser.hashMotDePasse);

        return await this.userRepository.create({
            nom: newUser.nom,
            prenom: newUser.prenom,
            email: newUser.email,
            role: newUser.role,
            telephone: newUser.telephone ?? null,
            hashMotDePasse: hashed,
            tenantId: newUser.tenantId,
            statut: newUser.statut,
        });
    }
}
